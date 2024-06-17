#!/usr/bin/env python

import os
import re
import requests
import subprocess
from dotenv import load_dotenv

load_dotenv()

# Replace with Pivotal Tracker API token and project ID in local environment
# Get PIVOTAL_TRACKER_API_TOKEN from https://www.pivotaltracker.com/profile
API_TOKEN = os.getenv("PIVOTAL_TRACKER_API_TOKEN")
# Get PIVOTAL_TRACKER_PROJECT_ID from the project settings page
PROJECT_ID = os.getenv("PIVOTAL_TRACKER_PROJECT_ID")

if not API_TOKEN or not PROJECT_ID:
  raise EnvironmentError(
    "Please set the PIVOTAL_TRACKER_API_TOKEN and PIVOTAL_TRACKER_PROJECT_ID environment variables."
  )


def get_all_iteration_stories():
  headers = {"X-TrackerToken": API_TOKEN}
  stories = []
  offset = 0
  limit = 100  # Pivotal Tracker's default page size

  while True:
    url = f"https://www.pivotaltracker.com/services/v5/projects/{PROJECT_ID}/iterations?scope=current_backlog&offset={offset}&limit={limit}"
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    iterations = response.json()

    for iteration in iterations:
      stories.extend(iteration["stories"])

    if len(iterations) < limit:
      break
    offset += limit

  return stories


def filter_non_done_tickets(stories):
  return [story for story in stories if story["current_state"] != "accepted"]


def get_commit_history():
  result = subprocess.run(
    ["git", "log", "--pretty=format:%H %s"], stdout=subprocess.PIPE
  )
  return result.stdout.decode("utf-8").split("\n")


def find_commit_id_to_return(commit_history, non_done_ticket_ids):
  blocking_commits = []
  for line in reversed(commit_history):
    commit_id, commit_message = line.split(" ", 1)
    ticket_id_match = re.search(r"#(\d+)", commit_message)
    if ticket_id_match:
      ticket_id = ticket_id_match.group(1)
      if ticket_id in non_done_ticket_ids:
        blocking_commits.append(commit_id)

  if blocking_commits:
    latest_blocking_commit_index = commit_history.index(
      [line for line in commit_history if blocking_commits[-1] in line][0]
    )
    return commit_history[latest_blocking_commit_index + 1].split(" ", 1)[0]

  return commit_history[0].split(" ", 1)[0]


def main():
  iteration_stories = get_all_iteration_stories()
  non_done_tickets = filter_non_done_tickets(iteration_stories)
  non_done_ticket_ids = {str(ticket["id"]) for ticket in non_done_tickets}

  if not non_done_ticket_ids:
    result = subprocess.run(["git", "rev-parse", "HEAD"], stdout=subprocess.PIPE)
    print(result.stdout.decode("utf-8").strip())
    return

  commit_history = get_commit_history()
  commit_id = find_commit_id_to_return(commit_history, non_done_ticket_ids)
  print(commit_id)


if __name__ == "__main__":
  main()
