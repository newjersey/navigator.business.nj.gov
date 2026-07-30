#!/usr/bin/env python3
"""Rescan Azure DevOps board membership and refresh `ado-boards.json`.

`ado_boards.project_for_ticket()` routes tickets with a numeric cutover plus
a hardcoded exceptions list (see that module's docstring for why: the two
ADO projects genuinely interleaved during a migration window, so no single
cutover is exact). Both the cutover and the exceptions were derived from a
one-off scan of `System.TeamProject` across ticket ids 15000-19000. This
script repeats that scan over an arbitrary id range so the routing data can
be refreshed later, e.g. to extend coverage as new tickets are created.

The ADO `workitemsbatch` REST endpoint does not filter by the project in its
URL path (querying via either project's URL returns identical org-wide
results), so this script queries at the org level and reads
`System.TeamProject` directly off each returned work item instead of
trusting which URL "found" it.

Usage:
    # Dry run: print the proposed ado-boards.json without writing it
    python3 scripts/refresh_ado_boards.py --start 17000 --end 21000

    # Write the result back to scripts/ado-boards.json
    python3 scripts/refresh_ado_boards.py --start 17000 --end 21000 --write

Auth:
    Same as `fetch_ado_ticket.py`: reads ADO_BEARER_TOKEN if set, otherwise
    requests one from the Azure CLI.
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Final

import requests

sys.path.insert(0, str(Path(__file__).resolve().parent))

from ado_boards import CURRENT_PROJECT, LEGACY_PROJECT, ADO_ORG
from fetch_ado_ticket import get_bearer_token

API_VERSION: Final[str] = "7.1"
BATCH_SIZE: Final[int] = 200
CONFIG_PATH: Final[Path] = Path(__file__).resolve().parent / "ado-boards.json"
RESOLVED_STATES: Final[frozenset[str]] = frozenset({"Done", "Closed", "Resolved"})


def fetch_team_projects(
    ticket_ids: list[int], token: str
) -> dict[int, tuple[str, str]]:
    """Return {ticket_id: (System.TeamProject, System.State)} for ids that exist."""
    url = f"https://dev.azure.com/{ADO_ORG}/_apis/wit/workitemsbatch?api-version={API_VERSION}"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    out: dict[int, tuple[str, str]] = {}

    for start in range(0, len(ticket_ids), BATCH_SIZE):
        batch = ticket_ids[start : start + BATCH_SIZE]
        body = {
            "ids": batch,
            "fields": ["System.Id", "System.TeamProject", "System.State"],
        }
        response = requests.post(url, json=body, headers=headers, timeout=30)
        response.raise_for_status()
        for item in response.json().get("value", []):
            fields = item.get("fields", {})
            team_project = fields.get("System.TeamProject")
            state = fields.get("System.State")
            if team_project and state:
                out[item["id"]] = (team_project, state)

    return out


def best_cutover(team_projects: dict[int, str]) -> tuple[int, int]:
    """Return (cutover, misclassified_count) for the single cutover that
    misclassifies the fewest ids if applied with no exceptions."""
    ids = sorted(team_projects)
    best_cutover_id, best_misclassified = ids[0], len(ids)

    for cutover in range(ids[0], ids[-1] + 1):
        misclassified = sum(
            1
            for ticket_id, project in team_projects.items()
            if (project == CURRENT_PROJECT) != (ticket_id >= cutover)
        )
        if misclassified < best_misclassified:
            best_cutover_id, best_misclassified = cutover, misclassified

    return best_cutover_id, best_misclassified


def exceptions_for_cutover(
    team_projects: dict[int, str],
    cutover: int,
    previous_exceptions: dict[str, list[int]],
    scanned_ids: set[int],
) -> dict[str, list[int]]:
    """Return the straggler ids that the cutover rule alone gets wrong.

    Previously recorded exceptions outside the newly scanned id range are
    preserved as-is, so a narrower rescan doesn't silently drop stragglers
    it never looked at.
    """
    legacy = {
        ticket_id
        for ticket_id, project in team_projects.items()
        if project == LEGACY_PROJECT and ticket_id >= cutover
    }
    current = {
        ticket_id
        for ticket_id, project in team_projects.items()
        if project == CURRENT_PROJECT and ticket_id < cutover
    }
    legacy |= {
        ticket_id
        for ticket_id in previous_exceptions["legacy"]
        if ticket_id not in scanned_ids
    }
    current |= {
        ticket_id
        for ticket_id in previous_exceptions["current"]
        if ticket_id not in scanned_ids
    }
    return {"legacy": sorted(legacy), "current": sorted(current)}


def format_with_prettier(path: Path) -> None:
    result = subprocess.run(
        ["npx", "prettier", "--write", str(path)], capture_output=True, text=True
    )
    if result.returncode != 0:
        print(
            f"warning: prettier formatting failed, run `npx prettier --write {path}` "
            f"by hand:\n{result.stderr}",
            file=sys.stderr,
        )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--start", type=int, required=True, help="First ticket id to scan (inclusive)."
    )
    parser.add_argument(
        "--end", type=int, required=True, help="Last ticket id to scan (inclusive)."
    )
    parser.add_argument(
        "--write",
        action="store_true",
        help="Write the result to scripts/ado-boards.json. Without this flag, only print it.",
    )
    args = parser.parse_args()
    if args.end < args.start:
        parser.error("--end must be >= --start")

    token = get_bearer_token()
    ticket_ids = list(range(args.start, args.end + 1))
    print(
        f"Scanning {len(ticket_ids)} ticket ids ({args.start}-{args.end})...",
        file=sys.stderr,
    )

    fetched = fetch_team_projects(ticket_ids, token)
    resolved = {
        ticket_id: project
        for ticket_id, (project, state) in fetched.items()
        if state in RESOLVED_STATES
    }
    print(
        f"Found {len(fetched)} existing work items, {len(resolved)} in a resolved state "
        f"({sorted(RESOLVED_STATES)}); unresolved ids are excluded from the cutover "
        f"and exceptions calculation.",
        file=sys.stderr,
    )
    if not resolved:
        sys.exit("No resolved work items found in this range; nothing to compute.")

    config = json.loads(CONFIG_PATH.read_text())

    cutover, misclassified = best_cutover(resolved)
    exceptions = exceptions_for_cutover(
        resolved, cutover, config["exceptions"], set(ticket_ids)
    )
    total_exceptions = len(exceptions["legacy"]) + len(exceptions["current"])
    print(
        f"Best cutover: {cutover} "
        f"({misclassified}/{len(resolved)} misclassified with no exceptions, "
        f"{total_exceptions} total exceptions after preserving unscanned ids)",
        file=sys.stderr,
    )

    config["currentProjectMinTicketId"] = cutover
    config["exceptions"] = exceptions
    updated_text = json.dumps(config, indent=2) + "\n"

    if args.write:
        CONFIG_PATH.write_text(updated_text)
        format_with_prettier(CONFIG_PATH)
        print(f"Wrote {CONFIG_PATH}", file=sys.stderr)
    else:
        print(updated_text)
        print(
            "Dry run: pass --write to update scripts/ado-boards.json.", file=sys.stderr
        )


if __name__ == "__main__":
    main()
