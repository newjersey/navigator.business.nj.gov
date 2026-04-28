# Static Site Package (`@businessnjgovnavigator/static-site`)

This package contains the locale-aware static landing site implementation for Business.NJ.gov. It
uses the Next.js App Router, renders NJWDS-based page sections through typed React components, and
loads localized content from validated message files.

## Table of Contents

1. [Architecture](#architecture)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Docker](#docker)
5. [Deployments](#deployments)
6. [Contributing](#contributing)
7. [License](#license)

## Architecture

The static-site package is organized around a locale-prefixed route shell (`app/[locale]`) and a
typed content pipeline.

- Route handling and metadata generation happen in `app/[locale]/layout.tsx` and
  `app/[locale]/page.tsx`.
- Locale middleware is configured in `proxy.ts` using `next-intl`.
- Locale definitions and navigation helpers live in `domain/i18n/*`.
- Localized message payloads are stored in `messages/*.json` and validated in
  `domain/i18n/messages.ts`.
- Landing page content is loaded through `domain/landing/loadLandingContent.ts`.
- Stateless presentation components are implemented in `components/landing/*`.
- Accessibility checks run in `tests/accessibility/*` with Playwright and axe-core.

### Built With

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [next-intl](https://next-intl.dev/)
- [NJWDS (`@newjersey/njwds`)](https://www.npmjs.com/package/@newjersey/njwds)
- [TypeScript](https://www.typescriptlang.org/)
- [Biome](https://biomejs.dev/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [axe-core](https://www.deque.com/axe/core-documentation/)
- [pnpm](https://pnpm.io/)

## Installation

From the repository root:

```bash
git clone https://github.com/newjersey/navigator.business.nj.gov.git
cd navigator.business.nj.gov
source scripts/install.sh
```

The install script sets up root dependencies and also installs/builds `packages/static-site` with
pnpm.

## Usage

Run commands from `packages/static-site`.

```bash
cd packages/static-site

# Start local dev server
pnpm dev

# Create production build
pnpm build

# Start production server
pnpm start

# Lint and formatting checks
pnpm lint
pnpm format:check

# Typecheck
pnpm typecheck

# Unit/component tests
pnpm test

# Browser accessibility tests
pnpm test:accessibility
```

## Docker

Run from `packages/static-site`.

```bash
# Production image (Next.js standalone output)
docker build -f Dockerfile -t static-site:prod .
docker run --rm -p 3000:3000 static-site:prod

# Local dev with hot reload
docker compose up --build
```

## Deployments

This package includes two deployment targets.

- ECS/Fargate via ECR + GitHub Actions:
  - CI workflow: `.github/workflows/static-site-ci.yml`
  - Deploy workflow: `.github/workflows/static-site-deploy-ecs.yml`
  - Task definition template: `packages/static-site/deploy/ecs-task-definition.json`
- AWS Amplify:
  - Build config: `amplify.yml` at repository root

ECS deploy workflow uses the existing AWS credential secret pattern and static-site-specific
resource variables (`STATIC_SITE_*`). Set `STATIC_SITE_ECS_ENABLED=true` in repository variables to
enable automatic deploys on `main`. Replace the placeholder role ARNs in
`packages/static-site/deploy/ecs-task-definition.json` before first deployment.

## Contributing

Before opening a pull request for this package, run:

1. `pnpm lint`
2. `pnpm typecheck`
3. `pnpm test`
4. `pnpm build`
5. `pnpm test:accessibility`

## License

This project is licensed under the MIT license. For more information, see
[LICENSE](../../LICENSE.md).
