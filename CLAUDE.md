# navigator.business.nj.gov

NJ state government web application helping businesses navigate licensing, formation, and compliance. TypeScript monorepo managed with Yarn 4 workspaces.

## Workspaces

| Package    | Purpose                                                            |
| ---------- | ------------------------------------------------------------------ |
| `shared/`  | Domain types and shared utilities — consumed by all other packages |
| `content/` | Compiles Markdown/YAML content into static exports                 |
| `api/`     | Express + AWS Lambda backend                                       |
| `web/`     | Next.js frontend                                                   |

Build order: `shared` → `content` → `api` / `web`

## Environment

- Node 24.12.0 (see `.nvmrc`). Run `yarn verify:node` to validate.
- Local services (DynamoDB Local, WireMock) via Docker: `docker-compose up -d`
- See `.env.example` files per package for required environment variables.

## Key Commands

```bash
# Local development
yarn services:up          # Start Docker services (DynamoDB, WireMock)
yarn start:dev            # Start all packages in dev mode (hot reload)

# Build
yarn build                # Build all workspaces in dependency order
yarn build:clean          # Clean then build

# Quality
yarn test                 # Run all tests (Jest for api/shared/web, Vitest for content)
yarn test:ci              # CI mode — unbuffered, single-threaded
yarn lint                 # Lint all workspaces
yarn typecheck            # TypeScript check all workspaces
yarn prettier             # Format all files

# Workspace-specific commands
yarn workspace api run test
yarn workspace web run test
```

## Running Tests

**Always run tests from the repo root**, not from inside a package directory:

```bash
# Correct
yarn test --testPathPattern="migrations"
yarn test --testPathPattern="api/src/api/userRouter"

# Wrong — don't do this
cd api && yarn test
```

## Content Config

The Decap CMS config at `web/public/mgmt/config.yml` is **auto-generated** at build time by merging YAML fragments. Never edit it directly — edit the source fragments in `web/` and run `yarn decap:build-config`.
