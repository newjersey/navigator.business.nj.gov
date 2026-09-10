# content/

Content build system. Compiles Markdown/YAML/JSON source files in `src/` into
static TypeScript exports consumed by `web` and `api` as
`@businessnjgovnavigator/content`.

**Other packages must never import content source files directly**. Always use
the compiled package exports.

## Commands

```bash
pnpm build          # Compile all content to lib/
pnpm test           # Vitest (NOT Jest; don't use Jest APIs here)
pnpm spellcheck     # cSpell validation
pnpm prettier
```

## Test Runner: Vitest

This package uses **Vitest**, not Jest. Do not use `jest.fn()`, `jest.mock()`,
or other Jest-specific APIs. Use `vi.fn()`, `vi.mock()`, etc.

## Content Types

Source content lives in `src/[type]/` directories. Examples:

| Directory               | Format                 |
| ----------------------- | ---------------------- |
| `faqs/`                 | Markdown + frontmatter |
| `fundings/`             | Markdown + frontmatter |
| `anytime-action-tasks/` | Markdown + frontmatter |
| `fieldConfig/`          | JSON                   |
| `filings/`              | Markdown + frontmatter |
| `certifications/`       | Markdown + frontmatter |
| `roadmaps/`             | YAML                   |

## Adding Content

1. Add a `.md` or `.yaml` file to the appropriate `src/[type]/` directory
2. Frontmatter fields are typed; check the corresponding type definition before
   adding new fields
3. Run `pnpm build` and `pnpm test` to validate
4. Run `pnpm spellcheck`; add domain-specific terms to `cspell.json` at the repo root if needed

## Synced Content

Fundings and licenses can be synced from external sources:

- Webflow: `pnpm webflow:run-sync` (from `web/`)
- Airtable: `pnpm airtable:dump` (from `web/`)

Do not hand-edit files that are managed by these sync scripts.

## Content Integrity Tests

```bash
pnpm --filter @businessnjgovnavigator/api run cms-integrity-tests
```

Validates cross-references between content entries and field config.
