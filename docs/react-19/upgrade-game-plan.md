# React 19 Upgrade: Complete Game Plan

This is a self-contained game plan for incrementally upgrading the navigator codebase to React 19 and associated dependencies.

**Execution model:** This work is delivered as a **single GitHub PR** containing a **sequence of commits**. Review happens **commit-by-commit**. Each section below corresponds to a **commit**, not a separate PR.

**Success criteria**: 100% passing unit tests, 100% passing Cypress E2E tests, code follows project guidelines and standards.

**Approach**: Upgrade blocking dependencies FIRST (while still on React 18), then flip to React 19 last. Each **commit** must be independently reviewable and meet its validation requirements before proceeding to the next commit.

**Campground rules**: Apply improvements consistently, but scope them appropriately:

- For **Mechanical Sweep** commits: only the mechanical target (no refactors).
- For **Module-Scoped** commits: apply campground rules within the declared module boundary.

---

## Table of Contents

0. [Upgrade Discipline (AI-operable)](#0-upgrade-discipline-ai-operable)
1. [Validation Workflow](#1-validation-workflow)
2. [Commit-by-commit Roadmap (single PR)](#2-commit-by-commit-roadmap-single-pr)
3. [Preserved Files (Full Source)](#3-preserved-files-full-source)
4. [Patterns to Preserve](#4-patterns-to-preserve)
5. [Anti-Patterns to Avoid](#5-anti-patterns-to-avoid)
6. [Campground Rules Checklist](#6-campground-rules-checklist)
7. [Reference: Why This Order](#7-reference-why-this-order)

---

## 0. Upgrade Discipline (AI-operable)

### 0.1 Single PR, commit-by-commit review

- This work is delivered as **one GitHub PR** with commits in the exact order described in Section 2.
- No fixup commits in the final PR: amend/rebase so each commit stands alone.
- Review expectation: each commit is reviewed independently (diff + message) and must be attributable.

### 0.2 Two-mode policy: Mechanical Sweep vs Module-Scoped (commit modes)

Each commit must declare its mode (A or B) and follow the rules for that mode.

#### Mode A — Mechanical Sweep commit (repo-wide, low complexity)

**Use when:** the change is mechanically uniform and reviewable by pattern (e.g., type-only replacements, signature updates, imports).

**Allowed:**

- Type-only changes and minimal imports required by types
- Signature changes required by library typings
- Repo-wide sweeps that are uniform and do not change behavior

**Forbidden:**

- Behavior changes, refactors, restructuring component trees, moving logic, changing hooks, adding/removing effects
- Adding timers (`setTimeout(0)`) as “React 19 fixes”
- Reformatting churn unrelated to the mechanical target

**Required commit message body sections:**

- Targets (the `rg` command(s) used to enumerate impacted files)
- Done checks (the `rg` command(s) that must come back empty)
- Tests run (at minimum `./scripts/pre-commit.sh`)

#### Mode B — Module-Scoped commit (behavioral or higher complexity)

**Use when:** the change affects runtime behavior, UI interaction, deployment/build, or complex refactors.

**Rules:**

- Declare a module boundary (paths) and keep changes within it (except unavoidable shared types/utilities).
- Campground rules apply within that boundary, not across unrelated parts of the repo.

**Required commit message body sections:**

- Scope (paths)
- Manual smoke steps (specific click/type flows)
- Done checks (scoped `rg` checks)
- Tests run (`./scripts/pre-commit.sh` + Cypress for runtime-touching changes)

### 0.3 Commit template (copy/paste)

Use this format in each commit message body:

```text
Commit: <N>/<Total>
Mode: A (Mechanical Sweep) | B (Module-Scoped)
Scope: <paths or “repo-wide mechanical sweep”>

Targets:
- <rg command(s) used to enumerate work>

Done checks:
- <rg command(s) that must return empty>

Manual smoke (Mode B):
- <steps>

Tests run:
- ./scripts/pre-commit.sh
- yarn workspace web cypress:run (Mode B runtime-touching)
```

## 1. Validation Workflow

Every commit must meet these validation requirements before proceeding to the next commit.

### Step 1: Pre-commit checks (linting, type checking, unit tests)

```bash
./scripts/pre-commit.sh
```

This runs:

- `./scripts/lint-fence-spell.sh` (ESLint, fence checks, spell checking)
- `yarn test` (Jest unit tests across all workspaces)

### Step 2: Dev server smoke test

In terminal 1:

```bash
yarn start:dev
```

Verify the application loads at `http://localhost:3000` and key pages render without console errors:

- Dashboard page
- Onboarding flow (click through first 2 pages)
- Profile page
- A task page

Additional targeted smoke checks (these historically broke during the React 19 branch work):

- Date picker typing: for each migrated picker, type a complete value without losing focus mid-entry.
- Numeric/masked input typing: verify Tax ID typing behaves correctly (no field “flipping” modes mid-entry).
- Mgmt CMS (if available in your environment): `/mgmt/cms` loads and does not hang indefinitely.

### Step 3: Cypress E2E tests

In terminal 2 (while dev server is running):

```bash
yarn workspace web cypress:run
```

All Cypress tests must pass. No `describe.skip()` or `it.skip()` allowed unless they existed on `main` before this work began.

### Quick validation (for small changes)

If a commit is **Mode A** (types-only / tests-only mechanical sweep) and touches no runtime behavior, Step 2 and 3 can be skipped. Step 1 is always required.

---

## 2. Commit-by-commit Roadmap (single PR)

### Dependency Graph

```
Commit 1 (Test infrastructure)
  ├─ Commit 2 (CSSTransition — replace react-transition-group)
  ├─ Commit 3 (MUI 5→7 + Date Pickers 5→8)
  │    └─ Commit 10 (Storybook 7→10)
  ├─ Commit 4 (unified/rehype ecosystem)
  ├─ Commit 5 (SWR 1→2)
  └──────────────────────────────────────────┐
       After commits 2-5 are complete:
            └─ Commit 6 (React prep: types mechanical sweep)
                 └─ Commit 7 (React prep: structural refactors)
                      └─ Commit 8 (React 18→19 core upgrade)
                           └─ Commit 9 (Build tooling / Docker)

Commit 11 (Test modernization: fireEvent→userEvent) — can be done any time after Commit 8, but keep it late to reduce review noise.
```

Implementation work for commits 2–5 can be prepared in parallel, but land as sequential commits in this single PR (so bisectability is preserved).

---

### Commit 1: Test Infrastructure Preparation

Mode: B (Module-Scoped; test-only)

**Goal**: Update test setup for React 19 compatibility without changing any production code or React version.

**Packages changed**: None

**Files to create/modify**:

- `web/setupTests.js` — add MessageChannel polyfill, enhance matchMedia mock, add global useConfig mock
- `web/test/helpers/accessible-queries.ts` — NEW FILE (copy from Preserved Files section below)
- `web/test/mock/mockUseConfig.ts` — NEW FILE (copy from Preserved Files section below)

**What to do in `web/setupTests.js`**:

1. Add the MessageChannel polyfill (see Preserved Files section for exact code)
2. Enhance the `window.matchMedia` mock to include modern API methods (`addEventListener`, `removeEventListener`, `dispatchEvent`)
3. Add the global `useConfig` mock at the bottom of the file
4. Keep the existing jest.setTimeout value as-is (do NOT change it to 30000 yet — only increase if tests actually time out)

**Campground rules for this commit**:

- While in `setupTests.js`, clean up any stale comments or unused mocks

**Acceptance criteria**:

- `./scripts/pre-commit.sh` passes
- No production code changed
- New test helpers importable from test files

---

### Commit 2: Replace react-transition-group with CSSTransition

Mode: B (Module-Scoped)

**Goal**: Remove `react-transition-group` (uses `findDOMNode`, incompatible with React 19) and replace with a custom `CSSTransition` component.

**Why before React 19**: `react-transition-group` uses `findDOMNode` (removed in React 19) and `prop-types`. Its peer dep claims `react >= 16.6.0` but it will break at runtime under React 19.

**Packages**:

- Remove: `react-transition-group`, `@types/react-transition-group`

**Files to create/modify**:

- `web/src/components/transitions/CssTransition.tsx` — NEW FILE (copy from Preserved Files section)
- `web/src/pages/onboarding.tsx` — update import from `react-transition-group` to the new component
- `web/package.json` — remove `react-transition-group` and `@types/react-transition-group`
- `package.json` (root) — remove `react-transition-group` if present
- Search for any other imports of `react-transition-group` and update them

**How to find all usages**:

```bash
rg -n "react-transition-group" web/src -S
```

**Acceptance criteria**:

- `./scripts/pre-commit.sh` passes
- `yarn start:dev` — onboarding page transitions work correctly
- `yarn workspace web cypress:run` — all E2E tests pass
- No imports of `react-transition-group` remain in the codebase

---

### Commit 3: MUI 5 → 7 + MUI X Date Pickers 5 → 8

Mode: B (Module-Scoped)

**Goal**: Upgrade Material-UI to v7 and Date Pickers to v8. MUI 7 peer dep is `react: ^17 || ^18 || ^19` so this works on React 18.

**Why before React 19**: MUI 7 should be validated independently so that if forms break, we know it's MUI, not React 19.

**Packages to upgrade**:

- `@mui/material` → `7.x`
- `@mui/icons-material` → `7.x`
- `@mui/system` → `7.x`
- `@mui/styles` → `6.x` (this is the latest for @mui/styles, which is legacy)
- `@mui/lab` → `7.x`
- `@mui/x-date-pickers` → `8.x`

**Key files affected**:

Dropdowns (MUI Autocomplete API changes):

- `web/src/components/CountryDropdown.tsx`
- `web/src/components/StateDropdown.tsx`
- `web/src/components/data-fields/IndustryDropdown.tsx`
- `web/src/components/data-fields/MunicipalityDropdown.tsx`
- `web/src/components/data-fields/Sectors.tsx`
- `web/src/components/tasks/cigarette-license/fields/CigaretteSupplierDropdown.tsx`

Date pickers (renderInput → slots API):

- `web/src/components/data-fields/DateOfFormation.tsx`
- `web/src/components/tasks/business-formation/business/FormationDate.tsx`
- `web/src/components/tasks/cigarette-license/fields/CigaretteSalesStartDate.tsx`
- `web/src/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitDatePicker.tsx`
- `web/src/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitTimePicker.tsx`

Navbar:

- `web/src/components/navbar/desktop/NavBarDesktop.tsx`
- `web/src/components/navbar/desktop/NavBarDesktopDropDown.tsx`
- `web/src/components/navbar/mobile/NavBarMobile.tsx`

Other:

- `web/src/components/GenericTextField.tsx` — MUI TextField changes (keep changes MINIMAL)
- `web/src/components/njwds-extended/SnackbarAlert.tsx`
- `web/src/components/ArrowTooltip.tsx`

**Date Picker Migration Pattern** (renderInput → slots):

Before (MUI X v5):

```tsx
<DatePicker
  inputFormat={"MM/YYYY"}
  mask={"__/____"}
  renderInput={(params) => <GenericTextField {...params} />}
  onChange={(newValue) => { ... }}
/>
```

After (MUI X v8):

```tsx
<DatePicker
  enableAccessibleFieldDOMStructure={false}
  views={["year", "month"]}
  format={"MM/YYYY"}
  value={dateValue}
  onChange={handleChange}
  slotProps={{
    textField: {
      inputProps: { placeholder: "__/____" },
      error: isFormFieldInvalid,
    },
  }}
  slots={{
    textField: (params: TextFieldProps): ReactElement => {
      return (
        <GenericTextField
          fieldName={fieldName}
          inputProps={params.InputProps}
          fieldOptions={{ ...params }}
        />
      );
    },
  }}
/>
```

Note: Use `enableAccessibleFieldDOMStructure={false}` because our custom `GenericTextField` slot assumes a single input. This preserves the legacy single-input structure.

**Campground rules for this commit**:

- While touching dropdown components: update `JSX.Element` return types to `ReactNode` in renderOption/renderInput callbacks
- While touching any component: add optional chaining (`?.`) guards on theme/palette access

**Acceptance criteria**:

- `./scripts/pre-commit.sh` passes
- `yarn start:dev` — all forms render, dropdowns open and select values, date pickers accept input without focus loss
- `yarn workspace web cypress:run` — all E2E tests pass
- No MUI deprecation warnings in console

---

### Commit 4: unified / remark / rehype + rehype-react 7 → 8

Mode: B (Module-Scoped)

**Goal**: Upgrade the markdown processing pipeline. `rehype-react@7` has `@types/react: ^17 || ^18` peer dep — does NOT support React 19 types. Must upgrade to v8 before React 19.

**Why before React 19**: `rehype-react@8` uses `hast-util-to-jsx-runtime` (React 19-compatible) and requires `unified@11`.

**Packages to upgrade**:

- `unified` → `11.x`
- `remark-parse` → `11.x`
- `remark-rehype` → `11.x`
- `remark-gfm` → `4.x`
- `remark-directive` → `4.x`
- `rehype-react` → `8.x`
- `rehype-stringify` → `10.x`
- `rehype-rewrite` → `4.x`

**Key files**:

- `web/src/components/PureMarkdownContent.tsx` — the critical file: switch from `createElement` to JSX runtime

Before:

```tsx
import React from "react";
import rehypeReact from "rehype-react";
// ...
.use(rehypeReact, { createElement: React.createElement })
```

After:

```tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeReact from "rehype-react";
// ...
.use(rehypeReact, {
  jsx,
  jsxs,
  Fragment,
  components: props.components,
})
```

- `web/src/components/Content.tsx` — may need adjustments if markdown rendering changes
- `shared/src/utils/tasksMarkdownReader.ts` — if API changes affect server-side markdown
- `shared/src/static/loadYamlFiles.ts` — if unified API changes affect YAML/MD loading
- `shared/src/static/loadAnytimeActionTasks.ts`
- `shared/src/static/loadAnytimeActionLicenseReinstatements.ts`

**Acceptance criteria**:

- `./scripts/pre-commit.sh` passes
- `yarn start:dev` — task pages display markdown correctly, CMS content renders, contextual info panels work
- `yarn workspace web cypress:run` — all E2E tests pass

---

### Commit 5: SWR 1 → 2

Mode: B (Module-Scoped)

**Goal**: Upgrade the data fetching library. Smallest upgrade — SWR 2 works on React 18.

**Packages**: `swr` → `2.x`

**Key files**:

- `web/src/lib/data-hooks/useUserData.test.tsx`
- `web/src/lib/storage/UserDataStorage.ts`
- Any custom SWR hooks or configurations

**SWR 2 breaking changes to watch for**:

- `mutate` API signature changes (third argument options)
- `revalidateOnFocus` default may differ
- Key function behavior changes

**Acceptance criteria**:

- `./scripts/pre-commit.sh` passes
- `yarn start:dev` — user data loads on dashboard, profile saves work
- `yarn workspace web cypress:run` — all E2E tests pass

---

### Commit 6: React 19 Prep — Types Mechanical Sweep

Mode: A (Mechanical Sweep)

**Goal**: Prepare the codebase for React 19 by applying **mechanically uniform, type-driven changes** across the repo while still on React 18. This commit must be easy to review by pattern and must not change runtime behavior.

**Packages**: `@types/react` → `19.x`, `@types/react-dom` → `19.x`

**Scope**: Repo-wide mechanical type sweep (web + shared + api).

**Targets (generate scope):**

```bash
rg -n "\\bJSX\\.Element\\b" web/src web/test shared/src api/src -S
rg -n "RefObject<[^>]+>" web/src shared/src api/src -S
```

**What to do (mechanical only):**

- Convert `JSX.Element` return types to `ReactNode` where appropriate (component return types and callback return types).
- Update `RefObject<T>` signatures to `RefObject<T | null>` when `useRef<T>(null)` is used or `.current` can be null.
- Apply the minimal required import fixes (`ReactNode`, `RefObject`, etc.).
- Do not change component structure or behavior.

**Done checks (must be empty or explicitly allowlisted in commit message):**

```bash
rg -n "\\bJSX\\.Element\\b" web/src web/test shared/src api/src -S
```

**Acceptance criteria**:

- `./scripts/pre-commit.sh` passes
- No behavior changes (types/signatures/imports only)

---

### Commit 7: React 19 Prep — Structural Refactors (module-scoped)

Mode: B (Module-Scoped)

**Goal**: Remove known React 19 runtime hazards while still running React 18. This commit is module-scoped: declare the scope up front and keep changes within it.

**Scope (declare in commit message):**

- Example: `web/src/components/navbar/**` (or another focused module)

**Allowed changes (within scope):**

- Module-level `getMergedConfig()` → function/component-level usage
- Nested component extraction (no components defined inside render bodies)
- Key-based remounting instead of effect-driven state syncing (only where necessary and covered by tests)

**Forbidden:**

- `setTimeout(0)` workarounds (see Anti-Patterns)
- Cypress hacks for typing (see Anti-Patterns)

Module-level `getMergedConfig()` → function-level (campground: do ALL files that have this pattern):

- `web/src/components/ChecklistTag.tsx`
- `web/src/components/TaskProgressTagLookup.tsx`
- `web/src/components/tasks/NaicsCodeInput.tsx`
- `web/src/components/tasks/business-formation/billing/getCost.ts`
- `web/src/components/tasks/business-formation/business/BusinessDateValidators.tsx`
- `web/src/components/xray/XrayStatus.tsx`
- `web/src/components/crtk/CrtkStatus.tsx`
- `web/src/contexts/dataFormErrorMapContext.ts`
- `web/src/lib/domain-logic/getEmployerAccessQuarterlyDropdownOptions.ts`
- `web/src/lib/domain-logic/getNextSeoTitle.ts`
- `web/src/lib/domain-logic/sendChangedNonEssentialQuestionAnalytics.ts`
- `web/src/lib/utils/helpers.ts`
- `web/src/lib/utils/onboardingPageHelpers.ts`
- `shared/src/contexts/configContext.ts`
- `shared/src/types/types.ts` — `profileFieldsFromConfig` → `getProfileFieldsFromConfig()`

Config context changes:

- `shared/src/contexts/configContext.ts` — add defaultConfig fallback, filter undefined imports
- `shared/src/contexts/defaultConfig.ts` — NEW FILE: default config for SSG fallbacks (consider auto-generating from a build step rather than hand-writing)

Nested component extraction:

- `web/src/pages/njeda.tsx` — extract `FundingsHeader` to module scope
- `web/src/pages/mgmt/cms.tsx` — reorder function declarations before effects

forwardRef → ref-as-prop (campground: do all in-scope files for the chosen module boundary):

- `web/src/components/njwds-extended/GenericButton.tsx`
- `web/src/components/njwds-extended/PrimaryButton.tsx`
- `web/src/components/njwds-extended/UnStyledButton.tsx`
- `web/src/components/njwds-extended/Alert.tsx`
- `web/src/components/ContextInfoElement.tsx`
- `web/src/components/GenericTextField.tsx`
- `web/src/components/profile/ProfileTab.tsx`
- `web/src/components/profile/ProfileTabHeader.tsx`
- `web/src/components/tasks/business-structure/LegalStructureRadio.tsx`
- `web/src/components/tasks/cigarette-license/CigaretteLicenseAlert.tsx`

Stable ID generation:

- `web/src/components/ExpandCollapseString.tsx` — use `useState` initializer for random IDs

**Acceptance criteria**:

- `./scripts/pre-commit.sh` passes
- TypeScript compiles with `@types/react@19`
- `yarn start:dev` — all pages render correctly
- `yarn workspace web cypress:run` — all E2E tests pass
- No module-level `getMergedConfig()` calls remain in the scoped paths:
  ```bash
  rg -n \"getMergedConfig\\(\\)\" <scoped_paths> -S
  ```
- No `forwardRef` usage remains in the scoped paths if ref changes were in-scope:
  ```bash
  rg -n \"forwardRef\\(\" <scoped_paths> -S
  ```

---

### Commit 8: React 18 → 19 Core Upgrade

**Goal**: Flip React to v19. By this point, all blocking libraries have been upgraded and the codebase has been prepped. This commit should be as SMALL as possible — only changes strictly required by the React 18→19 runtime differences.

**Packages**:

- `react` → `19.x`
- `react-dom` → `19.x`
- `eslint-plugin-react-hooks` → `7.x`

**Key files**:

Auth flow:

- `web/src/pages/_app.tsx` — update auth gating for React 19's stricter effect behavior. Keep it CLEAN — single check, not triple-checked.
- `web/src/lib/auth/signinHelper.ts` — if auth redirect logic needs updates

Onboarding:

- `web/src/pages/onboarding.tsx` — add `flushSync` for page navigation, page range validation effect
- `web/src/components/data-fields/ForeignBusinessTypeField.tsx` — checkbox state for form validation

Form handling:

- `web/src/lib/data-hooks/useFormContextHelper.ts` — async submission with ref guard
- `web/src/lib/data-hooks/useUnsavedChangesGuard.ts` — ref sync via useEffect
- `web/src/lib/data-hooks/useRoadmap.ts` — reorder function declarations

State initialization:

- `web/src/components/FormationDateModal.tsx` — useState initializer instead of useEffect sync
- `web/src/components/tasks/LicenseTask.tsx` — similar pattern

Pages:

- `web/src/pages/account-setup.tsx` — extract function to module scope
- `web/src/pages/loading.tsx` — handle SAML error display
- `web/src/pages/mgmt/deadurls.tsx`, `web/src/pages/mgmt/unusedContent.tsx` — getServerSideProps updates
- `web/src/pages/filings/[filingUrlSlug].tsx` — if needed

Test files:

- Many test files will need `async`/`await` + `act()` + `waitFor()` wrapping
- See "Patterns to Preserve" section for the exact pattern

**What NOT to do in this commit**:

- Do NOT add `setTimeout(0)` workarounds — fix the root cause (see Anti-Patterns section)
- Do NOT refactor `GenericTextField.tsx` with an `updateOnBlur` pattern — keep changes minimal
- Do NOT remove console.error/warn strictness from setupTests.js — use an allowlist if needed
- Do NOT add arbitrary `cy.wait()` delays to Cypress tests

**Acceptance criteria**:

- `./scripts/pre-commit.sh` passes
- `yarn start:dev` — full application works
- `yarn workspace web cypress:run` — ALL E2E tests pass (no skipped suites)
- Zero `setTimeout(0)` workarounds in production code
- `rg -n \"setTimeout\\([^,]+,\\s*0\\)\" web/src -S` returns zero results

---

### Commit 9: Build Tooling (Turbopack, Standalone Output, Docker)

**Goal**: Modernize the build and deployment pipeline.

**Files**:

- `web/next.config.js` → `web/next.config.ts` — full rewrite to TypeScript, add Turbopack config, standalone output
- `WebApp.Dockerfile` — multi-stage build
- `docker-compose.yml` — updated for new image
- `.github/actions/package-webapp-docker/action.yml` — CI changes. **CRITICAL: Do NOT use `env > web/.env.production` — write specific variables explicitly to avoid leaking secrets.**
- `scripts/healthcheck-web.sh` — NEW FILE (copy from Preserved Files, but fix netstat dependency)
- `web/scripts/copy-vendor-assets.ts` — NEW FILE (copy from Preserved Files)
- `web/scripts/patch-njwds-css.ts` — NEW FILE (copy from Preserved Files)
- `web/package.json` — add `copy-vendor-assets` and `patch-njwds` scripts, update build command

**Acceptance criteria**:

- `./scripts/pre-commit.sh` passes
- `yarn start:dev` works
- `docker build` succeeds
- Docker container starts and serves the app
- Health check endpoint responds
- `yarn workspace web cypress:run` — all E2E tests pass
- CI action does NOT dump all env vars into `.env.production`

---

### Commit 10: Storybook 7 → 10

**Goal**: Upgrade Storybook and ALL addons to consistent versions.

**Packages**: `storybook@10.x`, `@storybook/react@10.x`, `@storybook/nextjs@10.x`, and ALL addons at compatible versions.

**Critical rule**: ALL Storybook addon versions must be on the SAME major version. No mixing 7.x/8.x/9.x/10.x/11.x.

**Approach**: Use `npx storybook@latest upgrade` as a starting point, then verify addon compatibility.

**Files**:

- `web/package.json` — version bumps
- `.storybook/` configuration files
- `web/tsconfig.json` — ensure `stories` is in the `exclude` array

**Acceptance criteria**:

- `yarn storybook` starts without errors
- All stories render correctly
- No mixed major versions in Storybook packages
- `./scripts/pre-commit.sh` passes

---

### Commit 11: Test Modernization (fireEvent → userEvent)

**Goal**: Migrate test files from `fireEvent` to `userEvent` + `findByRole` + `waitFor` patterns for better accessibility and React 19 compatibility.

**Why a dedicated commit**: This is a large, systematic change. Keeping it isolated makes review and bisecting easier.

**Scope**: Every test file that imports `fireEvent` from `@testing-library/react`.

**How to find all files**:

```bash
rg -n "fireEvent" web/src web/test -S
```

**Migration pattern**:

Before:

```tsx
fireEvent.click(screen.getByText("Submit"));
expect(screen.getByTestId("result")).toBeInTheDocument();
```

After:

```tsx
await userEvent.click(await screen.findByRole("button", { name: "Submit" }));
expect(await screen.findByTestId("result")).toBeInTheDocument();
```

**Exception — numeric/masked inputs**: There is a known upstream bug (testing-library/user-event#1286) where `userEvent.type()` causes infinite loops with React 19 + MUI controlled numeric inputs. Use `fireEvent.change` for these cases and add a comment:

```tsx
// fireEvent for numeric inputs (userEvent causes infinite loop)
// See: https://github.com/testing-library/user-event/issues/1286
fireEvent.change(screen.getByLabelText("Tax ID"), {
  target: { value: "123456789012" },
});
```

**Query priority hierarchy** (prefer higher over lower):

1. `findByRole` — most accessible, async-safe
2. `findByLabelText` — good for form fields
3. `findByPlaceholderText` — fallback for unlabeled fields
4. `findByText` — use sparingly
5. `findByTestId` — last resort

**Campground rules for this commit**:

- Convert `getByRole` → `findByRole` (async) where the element appears after a state update
- Convert `getByText` → `findByRole` where possible (more accessible)
- Add `async` to test functions that use `await`
- Use `userEvent.setup()` at the top of test blocks for better event simulation
- Import and use helpers from `web/test/helpers/accessible-queries.ts` where they simplify code

**Acceptance criteria**:

- `./scripts/pre-commit.sh` passes
- `yarn workspace web cypress:run` — all E2E tests pass
- No `fireEvent` imports remain EXCEPT in files where `fireEvent.change` is used for numeric inputs (and each usage has a comment citing the upstream bug)

---

## 3. Preserved Files (Full Source)

These files should be copied verbatim into the codebase at the specified paths.

### `web/src/components/transitions/CssTransition.tsx`

```tsx
import { ReactElement, ReactNode, useEffect, useRef, useState } from "react";

interface CSSTransitionProps {
  children: ReactNode;
  in: boolean;
  unmountOnExit?: boolean;
  timeout: number;
  classNames: string;
}

/**
 * React 19 compatible CSSTransition component
 * Replacement for react-transition-group's CSSTransition
 *
 * Production: Uses requestAnimationFrame for better performance and synchronization with browser repaints
 * Tests: Skips animation state machine entirely (animations are covered by e2e tests)
 */
export const CSSTransition = (props: CSSTransitionProps): ReactElement | null => {
  const [shouldRender, setShouldRender] = useState(props.in);
  const [currentState, setCurrentState] = useState<"enter" | "exit" | "active" | null>(
    props.in ? "enter" : null,
  );
  const frameRef = useRef<number | undefined>(undefined);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isFirstMount = useRef(true);

  const isTestMode = process.env.NODE_ENV === "test";

  useEffect(() => {
    if (isTestMode) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (props.in) {
      frameRef.current = requestAnimationFrame(() => {
        setShouldRender(true);
        setCurrentState("enter");
        frameRef.current = requestAnimationFrame(() => {
          setCurrentState("active");
        });
      });
    } else if (shouldRender) {
      frameRef.current = requestAnimationFrame(() => {
        setCurrentState("exit");
        timeoutRef.current = setTimeout(() => {
          setCurrentState(null);
          if (props.unmountOnExit) setShouldRender(false);
        }, props.timeout);
      });
    }

    isFirstMount.current = false;

    return (): void => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [props.in, props.timeout, props.unmountOnExit, shouldRender, isTestMode]);

  if (isTestMode) {
    if (!props.in && props.unmountOnExit) return null;
    const baseClassNames = props.classNames.split(" ").filter(Boolean);
    const animationClass = baseClassNames[baseClassNames.length - 1];
    const otherClasses = baseClassNames.slice(0, -1).filter(Boolean);
    const finalClassName = [...otherClasses, `${animationClass}-enter-active`].join(" ");
    return <div className={finalClassName}>{props.children}</div>;
  }

  if (!shouldRender) return null;

  const getClassNames = (): string => {
    const baseClassNames = props.classNames.split(" ");
    const animationClass = baseClassNames[baseClassNames.length - 1];
    const otherClasses = baseClassNames.slice(0, -1).join(" ");

    switch (currentState) {
      case "enter":
        return `${otherClasses} ${animationClass}-enter`;
      case "active":
        return `${otherClasses} ${animationClass}-enter-active`;
      case "exit":
        return `${otherClasses} ${animationClass}-exit ${animationClass}-exit-active`;
      default:
        return props.classNames;
    }
  };

  return <div className={getClassNames()}>{props.children}</div>;
};
```

### `web/test/helpers/accessible-queries.ts`

```tsx
/**
 * Accessible, async-safe test query helpers for React 19 + MUI 7
 *
 * These helpers follow Testing Library best practices and handle React 19's
 * automatic batching and async rendering. Always prefer these over direct
 * text queries for better accessibility and more resilient tests.
 *
 * Query Priority Hierarchy:
 * 1. getByRole/findByRole (most accessible)
 * 2. getByLabelText/findByLabelText
 * 3. getByPlaceholderText
 * 4. getByText (use sparingly)
 * 5. getByTestId (last resort)
 */

import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export const findButton = async (name: string | RegExp): Promise<HTMLElement> => {
  return await screen.findByRole("button", { name });
};

export const findLink = async (name: string | RegExp): Promise<HTMLElement> => {
  return await screen.findByRole("link", { name });
};

export const findInput = async (labelOrPlaceholder: string): Promise<HTMLElement> => {
  try {
    return await screen.findByLabelText(labelOrPlaceholder);
  } catch {
    return await screen.findByPlaceholderText(labelOrPlaceholder);
  }
};

export const findTextbox = async (name: string | RegExp): Promise<HTMLElement> => {
  return await screen.findByRole("textbox", { name });
};

export const findCombobox = async (name: string | RegExp): Promise<HTMLElement> => {
  return await screen.findByRole("combobox", { name });
};

export const selectOptionByText = async (label: string, optionText: string): Promise<void> => {
  const input = await screen.findByLabelText(label);
  await userEvent.click(input);
  const listbox = await screen.findByRole("listbox");
  const option = within(listbox).getByRole("option", { name: optionText });
  await userEvent.click(option);
};

export const selectOptionByTestId = async (label: string, testId: string): Promise<void> => {
  const input = await screen.findByLabelText(label);
  await userEvent.click(input);
  const listbox = await screen.findByRole("listbox");
  const option = within(listbox).getByTestId(testId);
  await userEvent.click(option);
};

export const findAlert = async (): Promise<HTMLElement> => {
  return await screen.findByRole("alert");
};

export const findHeading = async (
  level: 1 | 2 | 3 | 4 | 5 | 6,
  name?: string | RegExp,
): Promise<HTMLElement> => {
  return await screen.findByRole("heading", { level, ...(name && { name }) });
};

export const findCheckbox = async (name: string | RegExp): Promise<HTMLElement> => {
  return await screen.findByRole("checkbox", { name });
};

export const findRadio = async (name: string | RegExp): Promise<HTMLElement> => {
  return await screen.findByRole("radio", { name });
};
```

### `web/test/mock/mockUseConfig.ts`

```tsx
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import * as useConfigModule from "@/lib/data-hooks/useConfig";

export const useMockConfig = (): void => {
  jest.spyOn(useConfigModule, "useConfig").mockReturnValue({ Config: getMergedConfig() });
};
```

### `web/scripts/copy-vendor-assets.ts`

```tsx
#!/usr/bin/env tsx

/**
 * Copies vendor assets from node_modules to public/vendor directory.
 * Replaces the webpack CopyPlugin functionality for Turbopack builds.
 */

import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, "../..");
const publicVendorDir = path.join(__dirname, "../public/vendor");

const copyTasks = [
  {
    from: path.join(rootDir, "node_modules/@newjersey/njwds/dist/img"),
    to: path.join(publicVendorDir, "img"),
    name: "NJWDS images",
  },
  {
    from: path.join(rootDir, "node_modules/@newjersey/njwds/dist/js"),
    to: path.join(publicVendorDir, "js"),
    name: "NJWDS JavaScript",
  },
];

async function copyVendorAssets(): Promise<void> {
  console.log("Copying vendor assets...");

  if (fs.existsSync(publicVendorDir)) {
    await fs.remove(publicVendorDir);
    console.log("  Cleaned public/vendor directory");
  }

  for (const task of copyTasks) {
    try {
      if (!fs.existsSync(task.from)) {
        console.warn(`  Source not found: ${task.name} (${task.from})`);
        continue;
      }
      await fs.copy(task.from, task.to);
      console.log(`  Copied ${task.name}`);
    } catch (error) {
      console.error(`  Failed to copy ${task.name}:`, (error as Error).message);
      process.exit(1);
    }
  }

  console.log("Vendor assets copied successfully");
}

(async (): Promise<void> => {
  try {
    await copyVendorAssets();
  } catch (error) {
    console.error("Failed to copy vendor assets:", error);
    process.exit(1);
  }
})();
```

### `web/scripts/patch-njwds-css.ts`

```tsx
#!/usr/bin/env tsx

/**
 * Patches @newjersey/njwds CSS to fix invalid pseudo-element syntax
 * that causes Turbopack build failures.
 *
 * Issue: ::before--tile is invalid CSS (should be ::before)
 * This is a workaround until the upstream package is fixed.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cssPath = path.join(__dirname, "../../node_modules/@newjersey/njwds/dist/css/styles.css");

try {
  if (!fs.existsSync(cssPath)) {
    console.log("@newjersey/njwds CSS file not found, skipping patch");
    process.exit(0);
  }

  let css = fs.readFileSync(cssPath, "utf8");
  const originalCss = css;
  css = css.replaceAll("::before--tile", "::before");
  css = css.replaceAll("::after--tile", "::after");

  if (css === originalCss) {
    console.log("@newjersey/njwds CSS already patched or no changes needed");
  } else {
    fs.writeFileSync(cssPath, css, "utf8");
    console.log("Patched @newjersey/njwds CSS for Turbopack compatibility");
  }
} catch (error) {
  console.error("Failed to patch @newjersey/njwds CSS:", (error as Error).message);
  process.exit(0);
}
```

### MessageChannel Polyfill (for `web/setupTests.js`)

Add this block to `web/setupTests.js`:

```javascript
// React 19 compatibility: MessageChannel polyfill for jsdom
// React 19 uses MessageChannel for scheduling state updates, so this must be functional
if (global.MessageChannel === undefined) {
  global.MessageChannel = class MessageChannel {
    constructor() {
      this.port1 = {
        postMessage: (data) => {
          if (this.port2.onmessage) {
            const schedule =
              typeof setImmediate === "undefined" ? (cb) => setTimeout(cb, 0) : setImmediate;
            schedule(() => {
              if (this.port2.onmessage) {
                this.port2.onmessage({ data });
              }
            });
          }
        },
        onmessage: null,
        close: () => {},
      };
      this.port2 = {
        postMessage: (data) => {
          if (this.port1.onmessage) {
            const schedule =
              typeof setImmediate === "undefined" ? (cb) => setTimeout(cb, 0) : setImmediate;
            schedule(() => {
              if (this.port1.onmessage) {
                this.port1.onmessage({ data });
              }
            });
          }
        },
        onmessage: null,
        close: () => {},
      };
    }
  };
}
```

### Enhanced matchMedia mock (for `web/setupTests.js`)

Replace the existing `window.matchMedia` mock with:

```javascript
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      media: "",
      onchange: null,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () {
        return true;
      },
    };
  };
```

### Global useConfig mock (for `web/setupTests.js`)

Add at the bottom of `setupTests.js`:

```javascript
jest.mock("@/lib/data-hooks/useConfig", () => {
  return {
    useConfig: () => {
      const { getMergedConfig } = require("@businessnjgovnavigator/shared/contexts");
      return { Config: getMergedConfig() };
    },
  };
});
```

---

## 4. Patterns to Preserve

These are healthy, sustainable patterns that should be applied consistently across the codebase.

### 4.1 ref-as-prop (replacing forwardRef)

React 19 allows function components to receive `ref` directly in props. This eliminates `forwardRef` boilerplate.

Before:

```tsx
import { forwardRef, Ref, ReactElement } from "react";

export const GenericButton = forwardRef(function GenericButton(
  props: GenericButtonProps,
  ref?: Ref<HTMLButtonElement>,
): ReactElement {
  return <button ref={ref}>{props.children}</button>;
});
```

After:

```tsx
export interface GenericButtonProps {
  ref?: React.Ref<HTMLButtonElement>;
  // ...other props
}

export function GenericButton(props: GenericButtonProps): ReactElement {
  /* eslint-disable react-hooks/refs */
  return <button ref={props.ref}>{props.children}</button>;
  /* eslint-enable react-hooks/refs */
}
```

**Rule**: If you accept `ref` in your props interface, you must forward it explicitly to a DOM element. Never rely on `{...props}` spread to forward refs — it is fragile and breaks silently.

**ESLint**: The `react-hooks` plugin does not yet understand ref-as-prop. Add `/* eslint-disable react-hooks/refs */` around JSX that uses `props.ref`. Track the plugin update and remove these comments when it ships.

### 4.2 Accessible test queries

Use `findByRole` (async) instead of `getByText` or `getByTestId`. This is more accessible and handles React 19's async batching.

```tsx
// Bad — not accessible, not async-safe
fireEvent.click(screen.getByText("Submit"));

// Good — accessible, async-safe
await userEvent.click(await screen.findByRole("button", { name: "Submit" }));
```

### 4.3 Children normalization

React 19 may pass a single child as a bare value instead of a length-1 array. Always normalize:

```tsx
const childrenArray = Array.isArray(props.children) ? props.children : [props.children];
```

### 4.4 Config access guarding

Guard config reads with optional chaining and nullish coalescing:

```tsx
// Bad
const title = config.starterKits.hero.title;

// Good
const title = config.starterKits?.hero?.title ?? "";
```

### 4.5 Module-level config to function-level

Never call `getMergedConfig()` at module scope. Always call it inside functions or component bodies:

```tsx
// Bad — executes at module load time
const Config = getMergedConfig();
const errorLookup = { NOT_FOUND: Config.task.errorText };

// Good — executes when called
const getErrorLookup = () => {
  const Config = getMergedConfig();
  return { NOT_FOUND: Config.task.errorText };
};
```

### 4.6 Nested component extraction

Never define components inside render bodies. Always hoist to module scope:

```tsx
// Bad — remounts on every parent render
const Parent = () => {
  const Header = () => <h1>Title</h1>;
  return <Header />;
};

// Good — stable identity
const Header = () => <h1>Title</h1>;
const Parent = () => <Header />;
```

### 4.7 Stable ID generation

Use `useState` initializer for random IDs instead of generating on every render:

```tsx
// Bad — new ID every render
<Component id={Math.random().toString().slice(2)} />;

// Good — stable for component lifetime
const [id] = useState(() => Math.random().toString().slice(2));
<Component id={id} />;
```

### 4.8 useState initializer instead of useEffect sync

Prefer initializing state from props and using `key` to remount, instead of syncing with useEffect:

```tsx
// Bad — double-render, can cause "Cannot update while rendering" warnings
const [data, setData] = useState(createEmpty());
useEffect(() => {
  if (business) setData(business.data);
}, [business]);

// Good — clean initialization, parent uses key={businessId} to remount
const [data, setData] = useState(business?.data ?? createEmpty());
```

### 4.9 ReactNode over JSX.Element

Use `ReactNode` for component return types and callback types. It is more flexible (allows strings, fragments, null):

```tsx
// Bad
renderOption={(...): JSX.Element => { ... }}

// Good
renderOption={(...): ReactNode => { ... }}
```

### 4.10 RefObject<T | null> typing

React 19's `@types/react` changes `useRef<T>(null)` to return `RefObject<T | null>`. Update function signatures accordingly:

```tsx
// Bad
function useMyHook(ref: RefObject<HTMLElement>): void { ... }

// Good
function useMyHook(ref: RefObject<HTMLElement | null>): void { ... }
```

### 4.11 JSX runtime for rehype-react

Use the modern JSX runtime instead of `React.createElement`:

```tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

.use(rehypeReact, { jsx, jsxs, Fragment, components: props.components })
```

### 4.12 flushSync for immediate DOM updates

Use `flushSync` only when you need to observe a state update immediately (focus management, routing, DOM measurement):

```tsx
import { flushSync } from "react-dom";

flushSync(() => {
  setPage({ current: newPage, previous: page.current });
});
routeToPage(newPage); // sees new page value
headerRef.current?.focus(); // focuses correct element
```

**Never use flushSync**: inside effects, as a general "React 19 fix", or for performance.

---

## 5. Anti-Patterns to Avoid

### 5.1 `setTimeout(0)` workarounds

**The problem**: React 19's batching surfaces "Cannot update a component while rendering a different component" warnings. `setTimeout(0)` defers the update but is a workaround, not a fix.

**When you see this warning, try these structural fixes IN ORDER:**

1. **Eliminate derived state duplication.** If `stateB` is always derived from `stateA`, compute it during render instead of syncing with an effect:

   ```tsx
   // Bad — syncing derived state
   const [items, setItems] = useState([]);
   const [count, setCount] = useState(0);
   useEffect(() => {
     setCount(items.length);
   }, [items]);

   // Good — compute during render
   const [items, setItems] = useState([]);
   const count = items.length;
   ```

2. **Move state updates to event handlers.** Effects that "sync" state are often misplaced event logic:

   ```tsx
   // Bad — effect-driven sync
   useEffect(() => {
     if (submitted) onSubmit(formData);
   }, [submitted]);

   // Good — event handler
   const handleSubmit = () => {
     onSubmit(formData);
   };
   ```

3. **Extract nested components.** A component defined inside a render body gets a new identity every render, causing unmount/remount cycles:

   ```tsx
   // Bad — nested component
   const Parent = () => {
     const Child = () => <div>{value}</div>;
     return <Child />;
   };

   // Good — extracted to module scope
   const Child = ({ value }) => <div>{value}</div>;
   const Parent = () => <Child value={value} />;
   ```

4. **Use useState initializer instead of useEffect.** Initialize state from source data and use `key` to remount:

   ```tsx
   // Bad — effect sync
   const [data, setData] = useState(empty);
   useEffect(() => {
     if (source) setData(source);
   }, [source]);

   // Good — initializer + key
   // Parent: <Component key={sourceId} source={source} />
   const [data, setData] = useState(source ?? empty);
   ```

5. **If none of the above work**, use `setTimeout(0)` BUT add a detailed comment explaining:
   - What warning/error occurs without it
   - Why structural fixes 1-4 don't apply
   - A link to an upstream issue if one exists

### 5.2 `nativeInputValueSetter` Cypress hack

**Never** reach into React's internal value setter on `HTMLInputElement.prototype`. If Cypress can't type into an input, the input handling is broken and should be fixed in the component, not worked around in the test.

### 5.3 Arbitrary `cy.wait()` delays

**Never** use `cy.wait(150)` or `cy.wait(2000)` in Cypress tests. Use retry-based assertions instead:

```tsx
// Bad
cy.wait(2000);
cy.get('[data-testid="result"]').should("exist");

// Good
cy.get('[data-testid="result"]', { timeout: 10000 }).should("exist");

// Better — wait for API response
cy.intercept("POST", "/api/submit").as("submit");
cy.get('[data-testid="submit"]').click();
cy.wait("@submit").its("response.statusCode").should("eq", 200);
```

### 5.4 Blanket console suppression in tests

**Never** remove `console.error`/`console.warn` strictness entirely. If React 19 produces new warnings, add them to an **allowlist**:

```tsx
const ALLOWED_WARNINGS = [
  "Warning: ReactDOM.render is no longer supported",
  // Add specific warnings here with justification
];

const originalError = console.error;
console.error = (...args) => {
  if (ALLOWED_WARNINGS.some((w) => args[0]?.includes?.(w))) return;
  originalError(...args);
};
```

### 5.5 Redundant "React 19:" comments

**Don't** add comments that restate what the code does:

```tsx
// Bad
// React 19: use setTimeout
setTimeout(() => setState(value), 0);

// Good — explains WHY
// Defer state update to avoid "Cannot update while rendering" warning
// when ProfileData effect triggers during parent's render phase.
// Structural fix blocked by: ProfileData is computed in parent render.
setTimeout(() => setState(value), 0);
```

### 5.6 Mixed fireEvent and userEvent without explanation

Every `fireEvent` usage in a test file that also uses `userEvent` needs a comment explaining why:

```tsx
// userEvent for most interactions
await userEvent.click(submitButton);

// fireEvent for numeric input (userEvent causes infinite loop)
// See: https://github.com/testing-library/user-event/issues/1286
fireEvent.change(taxIdInput, { target: { value: "123456789" } });
```

### 5.7 `jest.useFakeTimers()` with `findBy*` queries

React 19's `findBy*` queries use internal `setTimeout`-based polling. Fake timers prevent those polls from firing, causing hangs. If your test needs fake timers:

```tsx
// Advance timers before findBy* queries
jest.useFakeTimers();
// ...trigger something...
jest.advanceTimersByTime(1000);
jest.useRealTimers(); // switch back before findBy*
await screen.findByRole("button", { name: "Submit" });
```

---

## 6. Campground Rules Checklist

When working on any commit, apply these improvements consistently — but scope them based on the commit mode:

- **Mode A (Mechanical Sweep):** only the mechanical target(s) described in that commit.
- **Mode B (Module-Scoped):** apply campground rules within the declared module boundary.

### Always do:

- [ ] Convert `forwardRef` → ref-as-prop in any file you touch (when ref plumbing is in-scope)
- [ ] Convert `JSX.Element` → `ReactNode` for return types and callbacks
- [ ] Convert `RefObject<T>` → `RefObject<T | null>` for ref types
- [ ] Move module-level `getMergedConfig()` calls into functions/components
- [ ] Extract nested component definitions to module scope
- [ ] Guard config reads with `?.` and `?? ""`
- [ ] Remove stale comments, unused imports, dead code

### In test files:

- [ ] Convert `fireEvent` → `userEvent` (dedicated commit 11; also apply within scope when touching test files)
- [ ] Convert `getByRole` → `findByRole` where element appears after state update
- [ ] Convert `getByText` → `findByRole` where possible (more accessible)
- [ ] Add `async`/`await` to test functions using async queries
- [ ] Use accessible query helpers from `web/test/helpers/accessible-queries.ts`

### Never do:

- [ ] Don't add `setTimeout(0)` workarounds in production code (forbidden in this restart)
- [ ] Don't add `cy.wait()` with hardcoded timing delays
- [ ] Don't define components inside render bodies
- [ ] Don't call `getMergedConfig()` at module scope
- [ ] Don't add new `forwardRef` wrappers
- [ ] Don't use `JSX.Element` for new return types
- [ ] Don't suppress console errors without an allowlist

---

## 7. Reference: Why This Order

### Dependency peer requirements (verified via npm)

| Package                      | Peer dep on React                          | Compatible with React 18? | Must upgrade before React 19?           |
| ---------------------------- | ------------------------------------------ | ------------------------- | --------------------------------------- |
| `@mui/material@7.x`          | `^17 \|\| ^18 \|\| ^19`                    | Yes                       | Should (validate independently)         |
| `@mui/x-date-pickers@8.x`    | `^17 \|\| ^18 \|\| ^19`                    | Yes                       | Should (validate independently)         |
| `react-transition-group@4.x` | `>= 16.6.0` (but uses findDOMNode)         | Yes                       | **Must** (runtime breaks on React 19)   |
| `rehype-react@7`             | `@types/react: ^17 \|\| ^18`               | Yes                       | **Must** (types don't support React 19) |
| `rehype-react@8`             | Uses `hast-util-to-jsx-runtime`            | Yes                       | Target version                          |
| `unified@11`                 | None (pure markdown)                       | Yes                       | Required by rehype-react@8              |
| `swr@2`                      | `react: ^16.11 \|\| ^17 \|\| ^18 \|\| ^19` | Yes                       | Should (reduce blast radius)            |
| `storybook@10`               | React 18 or 19                             | Yes                       | After MUI 7 (for component rendering)   |

### Why React 19 goes last

1. **All blocking libraries are already upgraded** — no runtime surprises from incompatible deps
2. **Each preceding commit is validated independently** — if MUI 7 breaks forms, we know it's MUI, not React 19
3. **The React 19 commit itself is minimal** — only runtime behavioral changes, not library API changes
4. **Failures are attributable** — `git bisect` works across PRs
5. **Partial progress is mergeable** — even if React 19 stalls, commits 1–5 deliver value (newer MUI, fewer deps, better tests)

### Why React 19 changes behavior

React 19 is not a drop-in version bump. Key behavioral changes:

1. **Automatic batching everywhere.** React 18 batched only in event handlers. React 19 batches in `setTimeout`, promises, and native events too. Code that relied on intermediate renders between `setState` calls sees different behavior.

2. **Stricter concurrent-mode invariants.** You cannot update a component while rendering a different component. Effects that synchronously set state on mount can trigger warnings or infinite loops.

3. **`findDOMNode` removed.** Libraries using it (like `react-transition-group`) break at runtime.

4. **`@types/react` changes.** `RefObject<T>` requires explicit `| null`. Many signatures prefer `ReactNode` over `JSX.Element`.

5. **jsdom gaps.** React 19's scheduler uses `MessageChannel`. jsdom doesn't provide it. Tests hang without the polyfill.

6. **Stricter effect cleanup.** Effects with missing dependencies or stale closures surface more bugs.

The goal is not to fight React 19 with timers and workarounds. It is to write code that is correct under async rendering.
