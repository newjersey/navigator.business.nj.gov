# content/

Content build system. Compiles Markdown/YAML source files in `src/` into static TypeScript exports consumed by `web` and `api` as `@businessnjgovnavigator/content`.

**Other packages must never import content source files directly** — always use the compiled `lib/` exports.

## Commands

```bash
yarn build          # Compile all content to lib/
yarn test           # Vitest (NOT Jest — don't use Jest APIs here)
yarn spellcheck     # cSpell validation
yarn prettier
```

## Test Runner: Vitest

This package uses **Vitest**, not Jest. Do not use `jest.fn()`, `jest.mock()`, or other Jest-specific APIs. Use `vi.fn()`, `vi.mock()`, etc.

## Content Types

Source content lives in `src/[type]/` directories:

| Directory               | Count  | Format                 |
| ----------------------- | ------ | ---------------------- |
| `faqs/`                 | 116    | Markdown + frontmatter |
| `fundings/`             | 73     | Markdown + frontmatter |
| `anytime-action-tasks/` | 66     | Markdown + frontmatter |
| `fieldConfig/`          | 82     | JSON                   |
| `filings/`              | 50     | Markdown + frontmatter |
| `certifications/`       | varies | Markdown + frontmatter |
| `roadmaps/`             | varies | YAML                   |

## Adding Content

1. Add a `.md` or `.yaml` file to the appropriate `src/[type]/` directory
2. Frontmatter fields are typed — check the corresponding type definition in `lib/` before adding new fields
3. Run `yarn build` and `yarn test` to validate
4. Run `yarn spellcheck`; add domain-specific terms to `cspell.json` at the repo root if needed

## Synced Content

Fundings and licenses can be synced from external sources:

- Webflow: `yarn webflow:run-sync` (from `web/`)
- Airtable: `yarn airtable:dump` (from `web/`)

Do not hand-edit files that are managed by these sync scripts.

## Content Integrity Tests

```bash
yarn cms-integrity-tests    # run from api/
```

Validates cross-references between content entries and field config.
