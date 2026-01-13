#!/usr/bin/env python3

import os
import re
import requests
import subprocess
from typing import Dict, List, Optional, Set, Tuple

ORG = "NJInnovation"
PROJECT_ID = "aee72662-26da-4ded-83e3-7e34127c8f0d"
API_VERSION = "7.1"

DONE_STATES = {"Done", "Closed", "Resolved"}
FIELDS = ["System.Id", "System.Title", "System.State", "System.WorkItemType"]

AB_ID_RE = re.compile(r"AB#(\d+)")


def require_env(name: str) -> str:
    v = os.environ.get(name, "").strip()
    if not v:
        raise SystemExit(
            f"Missing required env var: {name}\n"
            f"Tip: run via ./scripts/run_release_helper.sh so ADO_BEARER_TOKEN is set."
        )
    return v


def run_git(args: List[str]) -> str:
    r = subprocess.run(["git", *args], check=True, capture_output=True, text=True)
    return r.stdout.strip()

def extract_ab_ids(commit_message: str) -> List[str]:
    return AB_ID_RE.findall(commit_message)


def chunked(seq: List[str], size: int) -> List[List[str]]:
    return [seq[i : i + size] for i in range(0, len(seq), size)]


def get_latest_release_tag(pattern: str = "v*") -> Tuple[str, str]:
    """
    Returns (tag_name, tag_sha) for the highest version tag matching pattern.
    This is more reliable than creatordate for release tags.
    """
    tags_out = run_git(["tag", "--list", pattern, "--sort=-version:refname"])
    tags = [t for t in tags_out.splitlines() if t.strip()]
    if not tags:
        raise RuntimeError(f"No tags found matching pattern: {pattern}")

    tag = tags[0].strip()
    sha = run_git(["rev-list", "-n", "1", tag]).strip().strip()
    return tag, sha

def get_commit_range(anchor_sha: str) -> List[str]:
    """
    Returns git log lines (newest comes first) for commits in (anchor_sha..HEAD].
    Each line: "<sha> <subject>"
    """
    r = subprocess.run(
        ["git", "log", f"{anchor_sha}..HEAD", "--pretty=format:%H %s"],
        check=True,
        capture_output=True,
        text=True,
    )
    return [line for line in r.stdout.splitlines() if line.strip()]


def fetch_work_items(ids: List[str]) -> Dict[str, Dict[str, str]]:
    """
    Returns: { "13063": {"System.State": "...", ...}, ... }
    Missing IDs will simply not appear in the returned dict.
    """
    token = require_env("ADO_BEARER_TOKEN")
    url = f"https://dev.azure.com/{ORG}/{PROJECT_ID}/_apis/wit/workitemsbatch?api-version={API_VERSION}"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    body = {"ids": [int(i) for i in ids], "fields": FIELDS}

    resp = requests.post(url, json=body, headers=headers, timeout=30)
    resp.raise_for_status()

    items = resp.json().get("value", [])
    out: Dict[str, Dict[str, str]] = {}
    for wi in items:
        wi_id = str(wi.get("id"))
        out[wi_id] = wi.get("fields", {})
    return out


def compute_blocking_ids(
    ab_ids: List[str],
    work_items: Dict[str, Dict[str, str]],
    done_states: Set[str],
    treat_missing_as_blocking: bool = True,
) -> Tuple[Set[str], Set[str]]:
    blocked: Set[str] = set()
    missing: Set[str] = set()

    for wid in ab_ids:
        fields = work_items.get(wid)
        if not fields:
            missing.add(wid)
            if treat_missing_as_blocking:
                blocked.add(wid)
            continue

        state = fields.get("System.State", "")
        if state not in done_states:
            blocked.add(wid)

    return blocked, missing


def list_blocking_commits(
    commits_newest_first: List[str],
    blocked_ids: Set[str],
) -> List[Tuple[str, str, List[str]]]:
    """
    Returns list of (sha, subject, blocking_ab_ids) for commits that reference blocked ids.
    """
    out: List[Tuple[str, str, List[str]]] = []
    for line in commits_newest_first:
        sha, subject = line.split(" ", 1)
        ids = sorted(set(extract_ab_ids(subject)) & blocked_ids)
        if ids:
            out.append((sha, subject, ids))
    return out

def find_cut_line_before_blocked(
    commits_newest_first: List[str],
    blocked_ids: Set[str],
    anchor_sha: str,
) -> str:
    """
    Returns the SHA immediately BEFORE the oldest blocked commit in the range.
    If no blocked commits exist, returns HEAD.
    If the oldest blocked commit is the first commit after anchor,
    returns anchor_sha.
    """
    ordered = list(reversed(commits_newest_first))  # oldest -> newest

    oldest_blocked_index = None
    for i, line in enumerate(ordered):
        sha, subject = line.split(" ", 1)
        if set(extract_ab_ids(subject)) & blocked_ids:
            oldest_blocked_index = i
            break

    if oldest_blocked_index is None:
        return commits_newest_first[0].split(" ", 1)[0]  # HEAD

    if oldest_blocked_index == 0:
        return anchor_sha

    return ordered[oldest_blocked_index - 1].split(" ", 1)[0]

def main():
    tag_name, anchor_sha = get_latest_release_tag("v*")

    commits = get_commit_range(anchor_sha)

    head_sha = run_git(["rev-parse", "HEAD"])
    print(f"\nAnalyzing commit range: {anchor_sha}..{head_sha}")
    print(f"Commits in range: {len(commits)}")

    print(f"\nRelease anchor tag: {tag_name}")
    print(f"Release anchor SHA: {anchor_sha}")

    if not commits:
        print("\nNo commits since last release tag. You are already at the release point.")
        print(f"Safe release SHA: {anchor_sha}\n")
        return

    ab_ids: List[str] = []
    for line in commits:
        _, subject = line.split(" ", 1)
        ab_ids.extend(extract_ab_ids(subject))
    ab_ids = sorted(set(ab_ids))

    if not ab_ids:
        print("\nNo AB# ids found in commits since last release.")
        print(f"Safe release SHA (HEAD): {commits[0].split(' ', 1)[0]}\n")
        return


    work_items: Dict[str, Dict[str, str]] = {}
    for batch in chunked(ab_ids, 200):
        work_items.update(fetch_work_items(batch))

    blocked, missing = compute_blocking_ids(ab_ids, work_items, DONE_STATES, treat_missing_as_blocking=True)

    print(f"\nAB items found since last release: {len(ab_ids)}")
    print(f"Done states configured as: {sorted(DONE_STATES)}")

    if missing:
        print(f"\nWARNING: Missing work items (treated as blocking): {', '.join(sorted(missing))}")

    if not blocked:
        print("\nNo blocking work items detected since last release.")
        print(f"Safe release SHA (HEAD): {commits[0].split(' ', 1)[0]}\n")
        return

    print(f"\nRelease is currently BLOCKED by {len(blocked)} engineering tickets:")
    for idx, wid in enumerate(sorted(blocked), start=1):
        fields = work_items.get(wid, {})
        state = fields.get("System.State", "MISSING")
        wtype = fields.get("System.WorkItemType", "")
        title = fields.get("System.Title", "")
        print(f"{idx}. AB#{wid} [{wtype}] {title}  [{state}]")


    cut_line_sha = find_cut_line_before_blocked(commits, blocked, anchor_sha)

    print("\nBlocking commits from newest to oldest):")
    print(f"{'TICKET':<12} {'COMMIT SHA':<42} {'COMMIT MESSAGE'}")
    print("-" * 110)

    for sha, subject, ids in list_blocking_commits(commits, blocked):
        ticket_str = ", ".join(f"AB#{i}" for i in ids)
        print(f"{ticket_str:<12} {sha:<42} {subject}")

    print(f"\nRecommended release cut line SHA: {cut_line_sha}")

    if cut_line_sha == anchor_sha:
        print(
            "(No releasable window: the earliest blocked ticket begins immediately after the anchor. "
            "Recommendation is to release nothing new; keep the release point at the anchor.)"
        )
    else:
        print("(This is the last commit before any incomplete work enters the release range.)")

    print("")

if __name__ == "__main__":
    main()
