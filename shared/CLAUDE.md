# shared/

Types and utilities used by both `web` and `api`. Published internally as `@businessnjgovnavigator/shared`.

If something is only used in one package, keep it there — don't add it here.

## Commands

```bash
yarn build          # TypeScript compilation (required before downstream packages see changes)
yarn test           # Jest
yarn typecheck
yarn lint
```

## Before Adding Something New

Check whether it already exists:

**Domain types**: `businessUser`, `userData`, `formationData`, `legalStructure`, `industry`, `license`, `taxFiling`, `municipality`, and 20+ others in `src/`

**Helpers**: `dateHelpers`, `stringHelpers`, `arrayHelpers`, `intHelpers`

**Domain logic**: `src/domain-logic/` — 20+ subdirectories covering licenses, formations, filings, operating phases, personas, and more

## Ripple Effect Warning

Changes to types here affect **both `web` and `api`**. After any change:

1. Run `yarn build` in `shared/` — downstream packages won't pick up changes until this completes
2. Run `yarn typecheck` from the **repo root** to catch breakage across all packages
3. If you changed user data types, also run `yarn generate:user-schema` in `api/`

## Exports

Everything is exported through `src/index.ts` (barrel file). Add new exports there — don't import directly from internal files in other packages.
