# packages/static-site/

Locale-aware static landing site (`@businessnjgovnavigator/static-site`). Next.js App Router with
`next-intl` i18n, NJWDS components, and Playwright accessibility tests. Deployed to ECS/Fargate.

**Toolchain differs from the rest of the repo:** uses **pnpm** (not yarn), **Biome** (not
ESLint/Prettier), and **Vitest** (not Jest). Run commands from `packages/static-site`.

## Commands

```bash
pnpm dev                 # Dev server on port 4000 (Turbopack)
pnpm build               # Production build (Next.js standalone output)
pnpm test                # Vitest unit/component tests
pnpm typecheck           # TypeScript check
pnpm lint                # Biome lint + format check
pnpm format              # Biome format (write)
pnpm test:accessibility  # Playwright + axe-core a11y tests (requires running server)
```

> `dev`, `build`, `start`, and `test:accessibility` all run `sync:njwds-assets` as a pre-step
> automatically. Don't skip or work around this pre-step.

## Architecture

- **`app/[locale]/`** — App Router shell; locale comes from the URL prefix (`en-US`, `es-US`)
- **`domain/i18n/`** — Locale definitions, message loading, and `next-intl` request config
- **`domain/content/`** — Typed content loading (`loadContent.ts`, `messageTypes.ts`)
- **`messages/`** — Localized JSON message files (`en-US.json`, `es-US.json`)
- **`components/`** — Stateless presentation components (check here before building new ones)
- **`tests/accessibility/`** — Playwright a11y tests using axe-core

## Non-obvious Rules

- **Do not use Jest APIs here.** Use `vi.fn()`, `vi.mock()`, etc. (Vitest, not Jest).
- **Do not use ESLint or Prettier.** Biome handles both linting and formatting.
- Localized strings live in `messages/*.json`. Do not hardcode user-facing copy in components.
- `proxy.ts` configures `next-intl` middleware for locale detection — edit with care.
- The Docker build runs from the **repo root** (needs access to generated content packages):
  ```bash
  docker build -f packages/static-site/Dockerfile -t static-site:prod .
  ```

## Done Criteria

- `pnpm lint && pnpm typecheck && pnpm test && pnpm build` all pass
- If UI changed, run `pnpm test:accessibility`
- Both `en-US` and `es-US` locales work for any user-facing changes
