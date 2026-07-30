#!/usr/bin/env python
"""Route Azure DevOps work item IDs to the correct board.

Azure DevOps work item IDs are unique across the `NJInnovation` org, not per
project, but this org has two projects: the legacy `Business First Stop`
board and the current `BizX` board. A work item URL must reference the
project that actually owns the ID, or Azure DevOps returns a "not found"
page.

There is no tracked API access to determine board membership without
authentication (both projects are private), so CI producers that need to
stay offline (`generate_ado_link.py`, `release.config.cjs`) use a hardcoded
numeric cutover instead: IDs below `CURRENT_PROJECT_MIN_TICKET_ID` are
assumed to be on the legacy board, IDs at or above it are assumed to be on
the current board. The cutover value lives in `ado-boards.json` so both this
Python module and `release.config.cjs` read the same number.

An org-wide scan of `System.TeamProject` for IDs 15000-19000 (2026-07-30)
found the two boards genuinely interleave around the migration: both
projects received tickets concurrently for a window rather than a clean
handoff. The best single cutover (17584) still misclassifies 52 of 2,659
resolved tickets in that window, so `ado-boards.json` also carries an
explicit `exceptions` list of the known straggler IDs on each side of the
cutover. IDs outside the scanned window are assumed to follow the cutover
rule cleanly.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Final
from urllib.parse import quote

__all__ = [
    "ADO_ORG",
    "LEGACY_PROJECT",
    "CURRENT_PROJECT",
    "CURRENT_PROJECT_MIN_TICKET_ID",
    "project_for_ticket",
    "work_item_base_url",
    "work_item_url",
]

_CONFIG_PATH: Final[Path] = Path(__file__).resolve().parent / "ado-boards.json"
_config = json.loads(_CONFIG_PATH.read_text())

ADO_ORG: Final[str] = _config["org"]
LEGACY_PROJECT: Final[str] = _config["projects"]["legacy"]
CURRENT_PROJECT: Final[str] = _config["projects"]["current"]
CURRENT_PROJECT_MIN_TICKET_ID: Final[int] = _config["currentProjectMinTicketId"]
_LEGACY_EXCEPTIONS: Final[frozenset[int]] = frozenset(_config["exceptions"]["legacy"])
_CURRENT_EXCEPTIONS: Final[frozenset[int]] = frozenset(_config["exceptions"]["current"])


def project_for_ticket(ticket_id: int | str) -> str:
    """Return the ADO project that owns a ticket, by numeric range.

    Checks the known straggler exceptions first (see module docstring),
    then falls back to the cutover rule.

    Args:
        ticket_id: A work item ID, as an int or a numeric string.

    Returns:
        `CURRENT_PROJECT` if the ID is at or above the cutover (and not a
        known legacy straggler), otherwise `LEGACY_PROJECT` (unless it is a
        known current-project straggler).

    Examples:
        >>> project_for_ticket(16426) == LEGACY_PROJECT
        True
        >>> project_for_ticket("17706") == CURRENT_PROJECT
        True
        >>> project_for_ticket(16176) == CURRENT_PROJECT  # known straggler
        True
        >>> project_for_ticket(17951) == LEGACY_PROJECT  # known straggler
        True
    """
    numeric_id = int(ticket_id)
    if numeric_id in _LEGACY_EXCEPTIONS:
        return LEGACY_PROJECT
    if numeric_id in _CURRENT_EXCEPTIONS:
        return CURRENT_PROJECT
    return (
        CURRENT_PROJECT
        if numeric_id >= CURRENT_PROJECT_MIN_TICKET_ID
        else LEGACY_PROJECT
    )


def work_item_base_url(ticket_id: int | str) -> str:
    """Return the ADO work-item edit URL prefix for a ticket's project.

    Examples:
        >>> work_item_base_url(16426)
        'https://dev.azure.com/NJInnovation/Business%20First%20Stop/_workitems/edit'
    """
    project = quote(project_for_ticket(ticket_id))
    return f"https://dev.azure.com/{ADO_ORG}/{project}/_workitems/edit"


def work_item_url(ticket_id: int | str) -> str:
    """Return the full ADO work-item edit URL for a ticket.

    Examples:
        >>> work_item_url(17706)
        'https://dev.azure.com/NJInnovation/BizX/_workitems/edit/17706'
    """
    return f"{work_item_base_url(ticket_id)}/{ticket_id}"
