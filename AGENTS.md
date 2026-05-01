# Agent Guidance

This repository uses agent guidance as a compact operating contract. Keep
`AGENTS.md` and `CLAUDE.md` synchronized; `AGENTS.md` is read by Codex and
`CLAUDE.md` is read by Claude Code.

## Project Shape

Business.NJ.gov Navigator is a TypeScript monorepo managed with Yarn 4
workspaces.

| Package                                          | Purpose                                                        |
| ------------------------------------------------ | -------------------------------------------------------------- |
| `shared/`                                        | Domain types, shared utilities, and cross-package domain logic |
| `content/`                                       | Markdown/YAML/JSON content build system                        |
| `api/`                                           | Express backend deployed as AWS Lambda functions               |
| `api/cdk/`                                       | AWS CDK infrastructure for the backend                         |
| `api/src/functions/messagingService/reactEmail/` | React Email templates compiled to static HTML/text             |
| `web/`                                           | Next.js frontend using MUI, SCSS, and Amplify auth             |

Build order is `shared` -> `content` -> `api` / `api-cdk` / `react-email` /
`web`.

## Working Rules

- Read nearby code first and follow existing patterns before introducing a new
  helper, abstraction, dependency, or convention.
- Keep changes scoped to the request. Do not perform opportunistic refactors,
  formatting churn, dependency upgrades, or metadata edits.
- Prefer clear, direct code over cleverness. If a function or module is hard to
  name, it is probably doing too much.
- Use static ES module syntax. Do not add `require`, `module.exports`, or
  dynamic imports unless the existing code path already requires them.
- Use `async`/`await`; do not add `.then()` chains for ordinary control flow.
  Start independent async work concurrently and await it with `Promise.all` or
  `Promise.allSettled`.
- Do not fire and forget promises. Await them, return them, or explicitly handle
  errors.
- Extract meaningful callback logic into named helpers. Inline lambdas are fine
  for thin adapters only.
- Avoid boolean-trap parameters. Prefer distinct named functions or a typed
  options object.
- Use specific TypeScript types. Do not use `any`; use `unknown` at boundaries
  and narrow it before use.
- Use named interfaces for parameter objects and exported shapes. Prefer
  readonly fields unless mutation is intentional.
- Validate external input at the boundary: users, APIs, environment variables,
  files, and CMS/config content are untrusted until checked.
- Keep side effects explicit and localized. Writes should be safe to retry when
  the domain allows it.
- Inject clients, loggers, and external dependencies. Avoid global singletons in
  business logic.
- Log through the repo's logging utilities, with operation context and without
  secrets, tokens, or personally identifiable information.
- When catching errors, add useful context and rethrow, transform to a typed
  error, or handle the failure explicitly. Do not silently continue.
- Tests should verify observable behavior, not implementation structure. Keep
  pure unit tests close to the code they cover.
- User-facing UI must be accessible: semantic elements, keyboard support,
  visible labels, and no meaning conveyed by color alone.
- Comments should explain non-obvious external constraints or edge cases.
  Prefer better names or extracted functions over comments that narrate code.

## Commands

Run commands from the repo root unless a package file explicitly documents a
package-local command.

```bash
# Environment
yarn verify:node
yarn services:up
yarn services:down

# Development
yarn start:dev

# Build and quality
yarn build
yarn build:clean
yarn lint
yarn typecheck
yarn prettier:check

# Tests
yarn test                  # Root Jest suite
yarn test:ci               # Root Jest suite in CI mode
yarn test:python           # Python script tests
yarn workspace @businessnjgovnavigator/content test

# Workspace-specific examples
yarn workspace @businessnjgovnavigator/api test
yarn workspace @businessnjgovnavigator/api-cdk test
yarn workspace @businessnjgovnavigator/react-email build
yarn workspace @businessnjgovnavigator/web test
yarn workspace @businessnjgovnavigator/shared test
```

## Repo-Specific Guardrails

- The Decap CMS config at `web/public/mgmt/config.yml` is generated. Edit
  source fragments and run `yarn decap:build-config`; do not hand-edit the
  generated config.
- Content source files are compiled by `content/` and consumed through
  `@businessnjgovnavigator/content`. Other packages should not import content
  source files directly.
- Shared types affect both `api` and `web`. After changing `shared/`, build it
  and run root typechecking.
- If user data types or migrations change, check the API migration and user
  schema guidance before editing.
- Prefer existing domain logic in `shared/src/domain-logic/`, `web/src/lib/`,
  and `api/src/libs/` before creating new utilities.

## Done Criteria

- The change is minimal, typed, and follows nearby patterns.
- Relevant unit or package tests were run, or you can state why they were not.
- `yarn typecheck` or a narrower typecheck was run for TypeScript behavior
  changes.
- Generated files are updated only through their generator.
- No unrelated user or branch changes were reverted.
