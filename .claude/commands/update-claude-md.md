Audit and update the CLAUDE.md files in this project to ensure they are accurate and up to date.

First, check whether the `claude-md-management:claude-md-improver` skill appears in your available skills list. If it does not, stop and tell the user:

> The `claude-md-management` plugin is required but not installed. Install it via the Claude Code plugin marketplace, then re-run `/update-claude-md`.

If the skill is available, invoke it using the Skill tool.

**Note:** In this project, `CLAUDE.md` is a symlink to `AGENTS.md`. Edits to `CLAUDE.md` will modify `AGENTS.md`. This is intentional — treat them as the same file.
