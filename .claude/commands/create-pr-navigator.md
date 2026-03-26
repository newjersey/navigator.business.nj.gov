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
   - A filled-in **body** for the Description sections only (Summary, Ticket, Approach, Steps to Test, Notes) — replace the HTML comment placeholders with content derived from the diff. For the ticket link, infer the ADO ticket number from the branch name if possible (branches often follow the pattern `description-#NNNNN`); if updating an existing PR, prefer preserving the ticket link already in the current description; otherwise use `#0000`.
   - **If updating:** reassemble the full body as: new Description sections + original checklist verbatim.
   - **If creating:** use the complete template structure including the blank checklist.

8. Show the user the generated title and body, and ask them to confirm before proceeding. Allow them to suggest edits or open in their editor.

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
