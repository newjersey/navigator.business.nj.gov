# Agent Guidance

`AGENTS.md` is the canonical agent guidance file. `CLAUDE.md` is a symlink to
it. `AGENTS.md` is read by Codex; `CLAUDE.md` is read by Claude Code.

## Project Shape

Business.NJ.gov Navigator is a TypeScript monorepo managed with pnpm
workspaces. See `.nvmrc` for the required Node version and root
`package.json`'s `packageManager` field for the required pnpm version
(installed automatically via Corepack).

| Package                                          | Purpose                                                                          |
| ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `shared/`                                        | Domain types, shared utilities, and cross-package domain logic                   |
| `content/`                                       | Markdown/YAML/JSON content build system                                          |
| `api/`                                           | Express backend deployed as AWS Lambda functions                                 |
| `api/cdk/`                                       | AWS CDK infrastructure for the backend                                           |
| `api/src/functions/messagingService/reactEmail/` | React Email templates compiled to static HTML/text                               |
| `web/`                                           | Next.js frontend using MUI, SCSS, and Amplify auth                               |
| `packages/content-types/`                        | Shared TypeScript content type definitions used by `content/` and `web`          |
| `packages/static-site/`                          | Static Next.js site (App Router, next-intl i18n, Biome, Vitest, Playwright a11y) |

All eight packages above are members of the single root `pnpm-workspace.yaml`.
`packages/static-site` still differs from the rest of the repo in its lint/
format and test tooling (Biome instead of ESLint/Prettier, Vitest instead of
Jest) — see `packages/static-site/AGENTS.md` — but it installs, builds, and
resolves dependencies through the same root pnpm workspace and lockfile as
everything else.

Build order is `content-types` -> `content` -> `shared` -> (`api`, `api-cdk`,
`react-email`, `web` together) -> `static-site`. The root `build` script
runs these stages explicitly in this order (not generic `pnpm -r`) because
`shared build` requires `content build`'s compiled output to already exist on
disk.

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
pnpm verify:node
pnpm services:up
pnpm services:down

# Development
pnpm start:dev

# Build and quality
pnpm build
pnpm build:clean
pnpm lint
pnpm typecheck
pnpm prettier:check

# Tests
pnpm test                  # Root Jest suite
pnpm test:ci               # Root Jest suite in CI mode
pnpm test:watch            # Root Jest suite in watch mode
pnpm test:python           # Python script tests
pnpm test:content          # content Vitest suite
pnpm test:static-site      # static-site Vitest suite
pnpm test:browser          # static-site Playwright accessibility + E2E suites

# Workspace-specific examples
pnpm --filter @businessnjgovnavigator/api run test
pnpm --filter @businessnjgovnavigator/api-cdk run test
pnpm --filter @businessnjgovnavigator/react-email run build
pnpm --filter @businessnjgovnavigator/web run test
pnpm --filter @businessnjgovnavigator/shared run test
```

## Repo-Specific Guardrails

- The Decap CMS config at `web/public/mgmt/config.yml` is generated. Edit
  source fragments and run `pnpm decap:build-config`; do not hand-edit the
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
- `pnpm typecheck` or a narrower typecheck was run for TypeScript behavior
  changes.
- Generated files are updated only through their generator.
- No unrelated user or branch changes were reverted.
