---
name: refresh-ado-boards
description: Rescan Azure DevOps work-item ids against the live API and refresh scripts/ado-boards.json's board-routing cutover and exceptions list. Use when new tickets fall outside the scanned range, when a generated ADO link 404s, or when asked to update/refresh/re-verify ADO ticket routing.
---

# refresh-ado-boards

## Context

`scripts/ado-boards.json` routes Azure DevOps work-item ids to one of two
projects (`Business First Stop` legacy, `BizX` current) using a numeric
cutover plus a hardcoded list of straggler exceptions. `scripts/ado_boards.py`
and `release.config.cjs` both read this file. It exists because the two
boards genuinely interleaved during a migration window: no single cutover
classifies every ticket correctly, so a scan-and-hardcode approach is used
instead of a live API call in CI producers.

This data goes stale as new tickets are created above the previously scanned
range, or if a generated link 404s because a ticket landed on the "wrong"
side of the cutover. `scripts/refresh_ado_boards.py` re-runs the scan; this
skill is the process for using it correctly.

## Process

### 1. Confirm Azure CLI auth

```bash
az account get-access-token --resource 499b84ac-1321-427f-aa17-267ca6975798 --query accessToken -o tsv
```

If this fails or prints nothing, run (and tell the user to complete the
interactive login):

```bash
az login --tenant 5076c3d1-3802-4b9f-b36a-e0a41bd642a7 --allow-no-subscriptions
```

`az login` only lists Azure AD subscriptions, not ADO org/project access —
that's expected and not a sign the login failed. The resource-scoped token
above is what actually proves ADO access.

### 2. Pick the id range to scan

- If refreshing because a specific ticket misrouted, scan a window around it
  (e.g. its id ± 500).
- If extending coverage for new tickets, scan from just above the previous
  scan's `--end` (check `scripts/ado_boards.py`'s module docstring for the
  last scanned range) through a reasonable buffer past the highest known
  current ticket id.
- Don't scan the full history unless asked; each id is one row in a batched
  API call, and scans are for the ids likely to be ambiguous, not a general
  cache refresh.

### 3. Dry run

```bash
source .venv/bin/activate
python3 scripts/refresh_ado_boards.py --start <id> --end <id>
```

This prints the proposed `ado-boards.json` to stdout and a summary to
stderr: how many resolved work items were found, the best single cutover
and its misclassification count with no exceptions, and the total exceptions
count after preserving any previously recorded stragglers outside the
scanned range. Read that summary before writing anything.

### 4. Sanity-check the diff

Compare the printed cutover and exceptions against the current
`scripts/ado-boards.json`. Flag anything surprising to the user before
writing:

- A cutover that moved by more than a few hundred ids.
- A large jump in the exceptions count (the original scan found ~2% of
  resolved tickets in the window were stragglers; a much higher rate
  suggests the range was chosen wrong, e.g. too early in the migration
  window).

### 5. Write and verify

```bash
python3 scripts/refresh_ado_boards.py --start <id> --end <id> --write
```

This writes `scripts/ado-boards.json` and formats it with prettier. Then run
the full check:

```bash
python -m unittest discover -b -s scripts -p "test_*.py"
python -m doctest scripts/ado_boards.py
node -e 'require("./release.config.cjs"); console.log("config ok")'
npx prettier --check scripts/ado-boards.json
```

### 6. Update the docstring

`scripts/ado_boards.py`'s module docstring names the scanned id range and
date of the last scan. Update it to reflect the new range and today's date
so the next refresh knows where the previous one left off.

### 7. Spot-check live

Pick one ticket id from the new exceptions list (if any) and confirm it
resolves via `scripts/fetch_ado_ticket.py <id>` to the project the scan
reported, not a 404.
