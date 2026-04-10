# content/

Content build system. Compiles Markdown/YAML/JSON source files in `src/` into
static TypeScript exports consumed by `web` and `api` as
`@businessnjgovnavigator/content`.

**Other packages must never import content source files directly**. Always use
the compiled package exports.

## Commands

```bash
yarn build          # Compile all content to lib/
yarn test           # Vitest (NOT Jest; don't use Jest APIs here)
yarn spellcheck     # cSpell validation
yarn prettier
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
3. Run `yarn build` and `yarn test` to validate
4. Run `yarn spellcheck`; add domain-specific terms to `cspell.json` at the repo root if needed

## Synced Content

Fundings and licenses can be synced from external sources:

- Webflow: `yarn webflow:run-sync` (from `web/`)
- Airtable: `yarn airtable:dump` (from `web/`)

Do not hand-edit files that are managed by these sync scripts.

## Content Integrity Tests

```bash
yarn workspace @businessnjgovnavigator/api cms-integrity-tests
```

Validates cross-references between content entries and field config.
