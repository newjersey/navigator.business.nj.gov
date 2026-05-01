# web/

Next.js 16 frontend with Material-UI, SCSS, and AWS Amplify auth.

## Commands

```bash
yarn dev            # Next.js dev server (webpack mode)
yarn build          # Production build
yarn test           # Jest + React Testing Library
yarn test:watch
yarn typecheck
yarn lint
yarn storybook      # Component development on port 6006
yarn cypress:run    # Headless E2E tests (requires services running)
```

## Before Writing New Code

**Check these locations before writing a new helper or hook**; the utility layer
is extensive:

| Location                         | Contains                                                                                   |
| -------------------------------- | ------------------------------------------------------------------------------------------ |
| `src/lib/domain-logic/`          | ZIP validation, tax ID formatting, industry checks, address parsing, step completion logic |
| `src/lib/utils/`                 | Text formatting, analytics tracking, display utilities, license status helpers             |
| `src/lib/data-hooks/`            | Custom React hooks for data fetching and state management                                  |
| `src/lib/auth/`                  | Authentication context, session helpers, auth-related hooks                                |
| `src/lib/storage/`               | localStorage / sessionStorage abstractions                                                 |
| `src/lib/roadmap/`               | Roadmap data structures and progression step fixtures                                      |
| `src/lib/taxation/`              | Tax-related utilities                                                                      |
| `@businessnjgovnavigator/shared` | Domain types, helpers, and cross-cutting domain logic                                      |

## `apiClient.ts` Protected Contract

`src/lib/api-client/apiClient.ts` is the **sole HTTP layer** between frontend
and backend. It is used throughout the entire app.

```typescript
post<T, R>(url: string, data: R, auth?: boolean): Promise<T>
get<T>(url: string, auth?: boolean): Promise<T>
```

**Do not change the signature or error-handling behavior of existing
functions.** If new capability is needed, add a new function; do not alter
`post` or `get`.

## App Structure

- **Pages**: `src/pages/` - standard Next.js file-based routing
- **Components**: `src/components/` - check here before building a new one
- **Global state**: `src/contexts/` - check for existing context before creating local state
- **MUI theme**: `src/lib/muiTheme.ts` - use theme tokens before writing one-off style overrides

## Content

Content is compiled by the `content/` package and consumed as a library.
**Never import content source files directly**. Use the built
`@businessnjgovnavigator/content` exports.

## E2E Tests

Cypress tests in `cypress/` use real data and real APIs. They require Docker
services (`yarn services:up`) and a running dev server.

## Module Aliases

Path aliases are configured in `tsconfig.json`. Use `@/components/...`, `@/lib/...`, etc. rather than relative paths crossing directory boundaries.
