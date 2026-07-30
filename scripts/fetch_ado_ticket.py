#!/usr/bin/env python3
"""Fetch an Azure DevOps work item and print its key fields as JSON.

Board membership is guessed from the ticket's numeric range (see
`ado_boards.py`), then confirmed against the live API. If the guessed
project 404s, the other project is tried once as a fallback, since the
range boundary is a heuristic and a handful of tickets are known to fall on
the wrong side of it.

Usage:
    python3 scripts/fetch_ado_ticket.py 17706

Auth:
    Reads ADO_BEARER_TOKEN if set, otherwise requests one from the Azure CLI
    (the same resource `scripts/run_release_helper.sh` uses). Both ADO
    projects in this org are private, so some authenticated session is
    required; there is no anonymous fallback.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Final
from urllib.parse import quote

import requests

sys.path.insert(0, str(Path(__file__).resolve().parent))

from ado_boards import ADO_ORG, CURRENT_PROJECT, LEGACY_PROJECT, project_for_ticket

API_VERSION: Final[str] = "7.1"
ADO_RESOURCE_ID: Final[str] = "499b84ac-1321-427f-aa17-267ca6975798"
DEFAULT_TENANT_ID: Final[str] = "5076c3d1-3802-4b9f-b36a-e0a41bd642a7"

LOGIN_HINT: Final[str] = (
    f"Failed to obtain an ADO bearer token.\n"
    f"Run: az login --tenant {DEFAULT_TENANT_ID} --allow-no-subscriptions"
)


def strip_html(html: str) -> str:
    if not html:
        return ""
    text = re.sub(r"<[^>]+>", " ", html)
    return re.sub(r"\s+", " ", text).strip()


def get_bearer_token() -> str:
    """Return an ADO bearer token from the Azure CLI's cached session.

    Mirrors `scripts/run_release_helper.sh`'s `get_token`, so a session
    established via `az login --tenant ...` for the release helper also
    works here.
    """
    result = subprocess.run(
        [
            "az",
            "account",
            "get-access-token",
            "--resource",
            ADO_RESOURCE_ID,
            "--query",
            "accessToken",
            "-o",
            "tsv",
        ],
        capture_output=True,
        text=True,
    )
    token = result.stdout.strip()
    if result.returncode != 0 or not token:
        raise SystemExit(LOGIN_HINT)
    return token


def fetch(ticket_id: str, project: str, token: str) -> dict:
    url = (
        f"https://dev.azure.com/{ADO_ORG}/{quote(project)}"
        f"/_apis/wit/workitems/{ticket_id}?api-version={API_VERSION}&$expand=fields"
    )
    headers = {
        "Authorization": f"Bearer {token}",
        "User-Agent": "navigator-pr-helper/1.0",
    }
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    return response.json()


def fetch_with_fallback(ticket_id: str, token: str) -> tuple[dict, str]:
    """Fetch a work item, retrying on the other board if the guess misses."""
    guessed_project = project_for_ticket(ticket_id)
    other_project = (
        LEGACY_PROJECT if guessed_project == CURRENT_PROJECT else CURRENT_PROJECT
    )

    try:
        return fetch(ticket_id, guessed_project, token), guessed_project
    except requests.HTTPError as guessed_error:
        if (
            guessed_error.response is not None
            and guessed_error.response.status_code == 404
        ):
            return fetch(ticket_id, other_project, token), other_project
        raise


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(f"Usage: {sys.argv[0]} <ticket_id>")
    ticket_id = sys.argv[1]

    token = get_bearer_token()
    data, project = fetch_with_fallback(ticket_id, token)

    fields = data.get("fields", {})
    print(
        json.dumps(
            {
                "project": project,
                "title": fields.get("System.Title", ""),
                "type": fields.get("System.WorkItemType", ""),
                "state": fields.get("System.State", ""),
                "description": strip_html(fields.get("System.Description", "")),
                "acceptance_criteria": strip_html(
                    fields.get("Microsoft.VSTS.Common.AcceptanceCriteria", "")
                ),
            }
        )
    )


if __name__ == "__main__":
    main()
