Create or update a GitHub Pull Request for the current branch using the PR template. If a PR already exists for the branch, update its description (preserving checklist state). Otherwise, create a new draft PR.

## Steps

1. Run `git branch --show-current` to get the current branch name.

2. Run `git fetch origin` to ensure we have the latest remote state.

3. Determine the base branch: use `$ARGUMENTS` if provided, otherwise default to `origin/main`.

4. Run `git diff <base-branch>..HEAD` to get the diff. If the diff is empty, tell the user and stop.

5. Check if a PR already exists for the current branch by running `gh pr view --json body,title 2>/dev/null`.
   - **If a PR exists:** extract and save the checklist section verbatim — everything from `## Code author checklist` to the end of the body, preserving any ticked/unticked checkbox states.
   - **If no PR exists:** note that a new draft PR will be created.

6. Read the PR template from `.github/pull_request_template.md` for section structure.

7. Using the diff, generate:
   - A concise PR **title** (50 characters or less, conventional commit format if appropriate: feat:, fix:, chore:, etc.)
   - A filled-in **body** for the Description sections only (Summary, Ticket, Approach, Steps to Test, Notes) — replace the HTML comment placeholders with content derived from the diff. For the ticket link:
     - If updating an existing PR, prefer preserving the ticket link already in the current description.
     - Otherwise, find the ticket number: check the branch name first (branches often follow the pattern `description-#NNNNN`), then fall back to `[AB#NNNNN]` in the subjects of commits on this branch (`git log <base-branch>..HEAD --pretty=format:%s`) — the commit-msg hook requires that prefix, so it is usually the more reliable source.
     - If a number is found, run `python3 scripts/fetch_ado_ticket.py <NNNNN>` to get the correct board (`Business First Stop` vs. `BizX`) plus the ticket's real `title`, `description`, and `acceptance_criteria`. Use the returned URL for the **Ticket** line. Use the `title` and `description` to sharpen the Summary and Approach sections, and the `acceptance_criteria` to inform Steps to Test, so the PR body reflects what the ticket actually asked for rather than just what the diff shows. `fetch_ado_ticket.py` needs an active Azure CLI session (`ADO_BEARER_TOKEN` or `az login`); if it exits non-zero, tell the user why (usually an expired session) and fall back to constructing the URL yourself from `scripts/ado-boards.json`'s `currentProjectMinTicketId` and `exceptions` list: check the exceptions first, otherwise IDs at or above the cutover use `BizX`, below it use `Business First Stop`. In the fallback case, the Description sections are derived from the diff alone (no ticket title/description/acceptance criteria available).
     - If no ticket number can be found at all, use `#0000` and say so in chat rather than silently guessing.
   - **If updating:** reassemble the full body as: new Description sections + original checklist verbatim.
   - **If creating:** use the complete template structure including the blank checklist.
   - **Formatting:** Do not use em dashes anywhere in the title or body; use a comma, period, or parentheses instead. GitHub renders single newlines literally (no soft-wrap collapsing), so end each list item and paragraph with a real line break and leave a blank line between paragraphs, rather than relying on wrapped text.

8. Show the user the generated title and full body text (never just describe it) inline in the chat, and ask them to confirm before proceeding. Allow them to suggest edits or open in their editor.

9. Once confirmed:
   - **If updating an existing PR**, run:

     ```shell
     gh pr edit --title "<title>" --body "<body>"
     ```

   - **If creating a new PR**, run:

     ```shell
     gh pr create --title "<title>" --body "<body>" --base <base-branch-without-origin-prefix> --draft
     ```

10. Output the PR URL and ask if they want to open it in the browser (`gh pr view --web`).
