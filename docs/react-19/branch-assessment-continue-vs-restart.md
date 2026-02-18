# React 19 Upgrade: Branch Assessment — Continue vs. Restart

## 1. Executive Summary

**Recommendation: Start fresh from `main` using an incremental, multi-PR approach.**

Key deciding factors:

- The `react-19` branch bundles **8+ independent major library upgrades** into a single, unrevertable commit. This makes it impossible to isolate failures, bisect regressions, or merge partial progress.
- **4 P0 blockers remain unresolved** (ECS health checks, Tax ID regression, tax registration error, `/mgmt/cms` hang), and their root causes are entangled across multiple upgrades.
- **3 Cypress E2E test suites are skipped** with `describe.skip()`, failing the 100% E2E pass rate requirement.
- **~15 `setTimeout(0)` workarounds** in production code and **pervasive `cy.wait()` timing hacks** in Cypress tests indicate incomplete understanding of root causes rather than structural fixes.
- The single-commit structure means **nothing can merge until everything is fixed**, while merge conflicts with `main` grow daily.

The existing branch is valuable as a **reference artifact** — its documentation, pattern catalog, and edge-case discoveries should be preserved and used as a guide for the incremental rebuild.

---

## 2. Branch Scope Analysis

### What's actually in this branch

The branch name is `react-19`, but the diff tells a different story. It contains at least 8 independent major upgrades:

| Upgrade                       | From                | To                                                | Magnitude                      |
| ----------------------------- | ------------------- | ------------------------------------------------- | ------------------------------ |
| React / React DOM             | 18.3.1              | 19.2.3                                            | 1 major version                |
| MUI (material, icons, system) | 5.18.0              | 7.3.6                                             | 2 major versions (skipping v6) |
| MUI X Date Pickers            | 5.0.20              | 8.23.0                                            | 3 major versions               |
| Storybook                     | 7.6.x               | 10.1.11                                           | 3 major versions               |
| unified / remark / rehype     | 10.x                | 11.x                                              | 1 major version                |
| SWR                           | 1.3.0               | 2.3.8                                             | 1 major version                |
| Next.js build mode            | webpack (JS config) | Turbopack (TS config) + standalone output         | Architectural                  |
| Docker / deployment           | `yarn start`        | `node server.js` (standalone) + multi-stage build | Architectural                  |

### Diff statistics

- **216 files** changed
- **14,051 lines** added, **7,785 lines** removed (net +6,266)
- **1 commit** (`b06b877f2d`)
- Of those 14K lines added: ~8,700 are `yarn.lock` (auto-generated) and ~2,600 are `defaultConfig.ts` (data). The authored code diff is approximately **2,700 lines**.

### Why bundling is the core problem

Each of these upgrades independently introduces breaking changes. When something breaks — and 4 P0 items already are — it is extremely difficult to:

1. **Attribute** the failure to a specific upgrade
2. **Fix** it without risking regressions in the other upgrades
3. **Merge** partial progress (it's all or nothing)
4. **Revert** one upgrade without reverting all of them
5. **Review** — 216 files in a single commit exceeds reasonable review capacity

---

## 3. Current State: Blockers & Risks

### 3.1 P0 Blockers

These are documented in `docs/react-19/pr-review-react-19-upgrade.md` and confirmed in PR #12395 discussion:

**P0-1: ECS health checks blocking deploy**

- `scripts/healthcheck-web.sh` depends on `netstat`, which may not exist in Alpine images
- The standalone output mode changes how the app serves — the health check endpoint needs validation in the actual ECS environment
- PR author comment: "Not my best work, but it works. I'm struggling getting ECS health checks to work."
- Root cause is tied to the Docker/standalone architectural change, not React 19 itself

**P0-2: Tax ID regression**

- PR comments report: "splitting into 2 fields, losing focus, then becoming 1 field again"
- Two changes entangled: (a) product behavior change allowing 9-digit Tax IDs for new entries, and (b) React 19 compatibility change removing `SplitTaxId.tsx` and consolidating to `SingleTaxId.tsx`
- Downstream of the `GenericTextField.tsx` refactor (276-line diff) that added an `updateOnBlur` local state buffer pattern
- Affects every form in the application that uses `GenericTextField`

**P0-3: Tax registration uncaught promise error**

- No root cause identified. No stack trace captured. No reproduction steps documented.

**P0-4: `/mgmt/cms` constant loading hang**

- `_app.tsx` has a 65-line auth gating rewrite with triple `/mgmt/` path checks
- Root cause likely in the interaction between rewritten auth flow, standalone output mode, and Decap CMS asset loading

### 3.2 Skipped E2E Tests

Three Cypress test suites are wrapped in `describe.skip()`:

| Test Suite                  | File                                                   | Reason                                                                             |
| --------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Dead links / unused content | `web/cypress/e2e/deadlinks.spec.ts`                    | Client-side redirect to landing page (curl works, browser doesn't)                 |
| License status check        | `web/cypress/e2e/group_5/license-status-check.spec.ts` | `license-status-form` not found after 30s timeout                                  |
| Remove business             | `web/cypress/e2e/group_5/remove-business.spec.ts`      | `onboarding-additional-business-indicator` not found — query param not propagating |

Each represents an unresolved React 19 behavioral regression.

### 3.3 Workaround Patterns

**~15 `setTimeout(0)` calls in production code** across components including:

- `DeferredOnboardingQuestion.tsx`, `FocusTrappedSidebar.tsx`, `loading.tsx`
- `CrtkStatus.tsx`, `CheckEligibility.tsx`, `XrayStatus.tsx`

These defer state updates to avoid concurrent rendering warnings. The branch's own patterns doc correctly identifies that structural fixes (eliminate derived state, move to event handlers) are preferred, but the code does not follow that guidance.

**Pervasive `cy.wait()` timing hacks in Cypress**:

- 6 arbitrary `cy.wait(150)` calls in onboarding foreign business tests
- `{delay: 100, force: true}` added to every typing interaction in tax clearance helpers
- `nativeInputValueSetter` hack reaching into React's internal value setter on `HTMLInputElement.prototype`
- `cy.wait(2000)` and `cy.wait(5000)` calls for Tax ID inputs

**`flushSync()` usage** in `onboarding.tsx` — correct but indicates the batching model changed in ways the architecture wasn't designed for.

### 3.4 Code Quality Concerns

**Storybook addon version chaos**: The `package.json` contains Storybook addons spanning 5 major versions simultaneously: 7.6.17, 8.6.14, 9.0.8, 10.1.11, and 11.1.1. This is an incomplete migration.

**CI security issue**: `.github/actions/package-webapp-docker/action.yml` uses `env > web/.env.production`, which dumps ALL CI environment variables (including secrets) into the build artifact.

**Dead code introduced**: `web/cypress/support/helpers/form-helpers.ts` (never imported), 8 unused accessible-query helpers, possible debug-only spec `test-unused-content-access.spec.ts`.

**GenericTextField.tsx refactor** (276-line diff): Adds `updateOnBlur` prop, local state buffer, `onImmediateChange`/`onBlur` callbacks, and refactored filter/validation pipeline. This is the core input component used by every form — a high-risk change surface.

**Console error/warn strictness removed** in `setupTests.js`: Previously threw on unexpected console errors in tests; now blanket-suppressed instead of using an allowlist. Hides genuine regressions.

**Jest timeout tripled** from 10s to 30s, reducing the test suite's ability to catch performance regressions.

**~134 "React 19:" comments** adding noise throughout the codebase.

---

## 4. Cost-Benefit Analysis

### Option A: Continue with this branch

**What's been done that has value:**

| Artifact                                                     | Lines                    | Reusable?                              |
| ------------------------------------------------------------ | ------------------------ | -------------------------------------- |
| Patterns documentation (3 files in `docs/react-19/`)         | ~2,400                   | Fully reusable regardless of approach  |
| CSSTransition component                                      | ~118                     | Copy directly                          |
| MessageChannel polyfill + matchMedia mock in `setupTests.js` | ~50                      | Copy directly                          |
| JSX runtime integration for `rehype-react`                   | ~10                      | Copy directly                          |
| `accessible-queries.ts` test utility                         | ~174                     | Copy directly                          |
| ref-as-prop conversions                                      | ~20 files, small changes | Patterns documented, easy to reproduce |
| Config lazy evaluation refactoring                           | ~15 files                | Patterns documented, reproducible      |
| Test async wrapping (`act` + `waitFor`)                      | ~60 files                | Systematic, AI-reproducible            |

**Remaining work to reach 100% passing tests + code standards:**

1. Fix 4 P0 blockers (unknown effort; P0-2 and P0-4 are likely multi-day investigations)
2. Fix 3 skipped Cypress E2E test suites
3. Replace ~15 `setTimeout(0)` calls with structural fixes
4. Resolve Storybook addon version inconsistencies
5. Replace ~40 `cy.wait()` calls with retry-based assertions
6. Remove `nativeInputValueSetter` hack from Cypress helpers
7. Validate or rework `GenericTextField` `updateOnBlur` pattern
8. Fix CI env injection security issue
9. Remove dead code
10. Fix NavMenuItem hover regression
11. Fix CrtkSearchResult hardcoded CMS string
12. Clean up ~134 "React 19:" comments
13. Re-add console error strictness with allowlist
14. Validate dependency downgrades (`@smithy/node-http-handler` 4→2, `supertest` 7→6, `sass-loader` 16→14)
15. Test react-email templates
16. Validate `enableAccessibleFieldDOMStructure={false}` on date pickers

**Key risk**: P0 investigations may reveal architectural issues (particularly around `GenericTextField` and standalone mode) requiring substantial rework, potentially invalidating large portions of existing changes. The single-commit structure means nothing can merge until everything is fixed.

### Option B: Start fresh with incremental PRs

**Advantages:**

- Each PR is independently mergeable with green CI
- Failures can be bisected to a specific upgrade
- Individual upgrades can be reverted without affecting others
- Merge conflicts are minimized (each PR merges quickly)
- Code reviewers can reason about 20-30 files, not 216
- Time-to-first-value is days, not weeks

**What can be reused** (see Section 6 for full list):

- All documentation files
- CSSTransition component
- Test infrastructure (polyfills, mocks)
- The pattern catalog as a checklist
- Edge-case discoveries documented in PR comments

**What AI tooling can reliably handle:**

- Type-level changes (`RefObject<T|null>`, `JSX.Element` → `ReactNode`) — mechanical, repetitive
- Config lazy evaluation conversions — grep-find-replace with minor judgment
- Test async wrapping (`act`/`waitFor`) — systematic, well-defined patterns
- `fireEvent` → `userEvent` migrations — systematic with documented exceptions
- Package version bumps and peer dependency resolution

**What requires human judgment:**

- `GenericTextField` refactoring (architectural decision on controlled input handling)
- Tax ID behavior changes (product rules, not just code)
- Auth flow in `_app.tsx` (multi-surface interaction)
- Docker/ECS deployment validation (requires infrastructure access)
- Date picker `enableAccessibleFieldDOMStructure` decisions

### Comparison

| Factor                      | Option A (Continue)              | Option B (Fresh)                |
| --------------------------- | -------------------------------- | ------------------------------- |
| Files at risk per merge     | 216 (all at once)                | 10-30 per PR                    |
| Ability to bisect failures  | None (single commit)             | `git bisect` works across PRs   |
| Ability to revert           | All or nothing                   | Individual upgrade              |
| P0 investigation complexity | Multiple root causes entangled   | Each upgrade isolated           |
| CI validation               | All-or-nothing                   | Incremental green builds        |
| Merge conflict risk         | Growing daily, nothing can merge | Each PR merges quickly          |
| Time-to-first-value         | Zero until all P0s fixed         | PR 1-3 can merge within days    |
| Knowledge transfer          | One person understands full diff | Each PR reviewable in isolation |
| Code review burden          | 216 files, 14K lines             | Manageable per-PR reviews       |

### Sunk cost analysis

The 14,051 lines added represent real work, but most of the intellectual value is preserved:

- **yarn.lock** (8,691 lines, ~62% of additions) — auto-generated, zero intellectual value
- **defaultConfig.ts** (2,637 lines) — generated/copied data, not authored logic
- **Documentation** (3 files, ~2,400 lines) — fully reusable
- **Authored code diff** (~2,700 lines) — the patterns are documented and reproducible; the second implementation will be faster and cleaner

The true loss from restarting is the **time already spent**, not the **code already written**. The code's patterns are preserved in documentation; only the exact lines need to be re-typed, and many of those are systematic changes AI can handle.

---

## 5. PR-by-PR Implementation Roadmap

### Critical dependency insight

The original branch treated React 19 as the first domino, with everything else following. But npm peer dependency analysis reveals several upgrades **must happen before React 19**, not after:

| Library                  | Why it must be upgraded BEFORE React 19                                                                                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `react-transition-group` | Uses `findDOMNode` (removed in React 19) and `prop-types`. Peer dep claims `react >= 16.6.0` but is **runtime-incompatible** with React 19. Tests will fail.                                                                                     |
| `rehype-react` (7→8)     | v7 has `@types/react: ^17.0.0` or `^18.0.0` peer dep — **does not support React 19 types**. Must upgrade to v8 which uses `hast-util-to-jsx-runtime` (React 19-compatible). Pulls in `unified@11` as a dependency.                               |
| MUI 5→7                  | MUI 7 peer dep is `react: ^17 \|\| ^18 \|\| ^19` — **works on React 18**. Should be upgraded and validated independently before adding React 19 as a variable. MUI 5 also technically claims React 19 support but was written for React 18 APIs. |
| SWR 1→2                  | SWR 2 works on React 18. No reason to couple with React 19.                                                                                                                                                                                      |

This means the correct PR ordering is: **upgrade dependencies first, then flip to React 19 last** (when all blocking libraries are already compatible).

---

### PR 1: Test Infrastructure Preparation

**Scope**: Update test setup for future React 19 compatibility without changing any production code or React version.

**Packages**: None changed (prep work only)

**Key files**:

- `web/setupTests.js` — add `MessageChannel` polyfill, enhance `matchMedia` mock
- `web/test/helpers/accessible-queries.ts` — new async-safe query helpers
- `web/test/mock/mockUseConfig.ts` — new config mock helper

**Dependencies**: None

**AI-assistable**: Fully — copy from existing branch, adjust as needed

**Acceptance criteria**: All existing unit tests pass. No production code changed.

---

### PR 2: Replace react-transition-group with CSSTransition

**Scope**: Remove `react-transition-group` (which uses `findDOMNode` and `prop-types`, both incompatible with React 19) and replace with the custom `CSSTransition` component. **This must happen before React 19.**

**Packages**: Remove `react-transition-group`, remove `@types/react-transition-group`

**Key files**:

- `web/src/components/transitions/CssTransition.tsx` — new component (copy from existing branch)
- `web/src/pages/onboarding.tsx` — uses CSSTransition for page transitions
- Any other components importing from `react-transition-group`

**Dependencies**: PR 1

**AI-assistable**: Mostly — component is already written and well-designed. Integration points need human verification.

**Acceptance criteria**: Onboarding page transitions work correctly. No visual regressions. All unit and E2E tests pass. Component skips animations in test mode.

---

### PR 3: MUI 5 → 7 + MUI X Date Pickers 5 → 8

**Scope**: Upgrade Material-UI core libraries and date pickers. MUI 7 has peer dep `react: ^17 || ^18 || ^19`, so **this works on React 18** and should be validated independently before React 19 is introduced. Combining core MUI and date pickers into one PR is acceptable since they share the same release cadence, though they can be split if the change set is too large.

**Packages**: `@mui/material@7.x`, `@mui/icons-material@7.x`, `@mui/system@7.x`, `@mui/styles@6.x`, `@mui/lab@7.x`, `@mui/x-date-pickers@8.x`

**Key files**:

- All components using MUI: dropdowns (`CountryDropdown.tsx`, `StateDropdown.tsx`, `MunicipalityDropdown.tsx`, `IndustryDropdown.tsx`), buttons, tooltips, modals, snackbars
- `web/src/components/navbar/` — NavBar components use MUI extensively
- `web/src/components/GenericTextField.tsx` — MUI TextField changes (keep minimal)
- Date picker components: `DateOfFormation.tsx`, `FormationDate.tsx`, `CigaretteSalesStartDate.tsx`, `EmergencyTripPermitDatePicker.tsx`, `EmergencyTripPermitTimePicker.tsx`
- Any component using `@mui/styles` (legacy styling, may need migration path)

**Dependencies**: PR 1

**AI-assistable**: Partially — API changes are documented in MUI migration guides. Component-specific behavior changes and `enableAccessibleFieldDOMStructure` decisions need human testing.

**Acceptance criteria**: All unit tests pass. All date-related E2E tests pass. Date pickers render correctly and accept input without focus loss. Visual spot-check of key pages. No MUI console warnings.

---

### PR 4: unified / remark / rehype + rehype-react 7 → 8

**Scope**: Upgrade the markdown processing pipeline. `rehype-react@7` has `@types/react: ^17 || ^18` — **it does not support React 19 types**. Must upgrade to `rehype-react@8` (which uses `hast-util-to-jsx-runtime`) before React 19. `rehype-react@8` requires `unified@11`, which pulls the rest of the ecosystem forward.

**Packages**: `unified@11.x`, `remark-parse@11.x`, `remark-rehype@11.x`, `remark-gfm@4.x`, `remark-directive@4.x`, `rehype-react@8.x`, `rehype-stringify@10.x`, `rehype-rewrite@4.x`

**Key files**:

- `web/src/components/PureMarkdownContent.tsx` — JSX runtime integration (`jsx`, `jsxs`, `Fragment` from `react/jsx-runtime`)
- `web/src/components/Content.tsx` — if markdown rendering changes affect content display
- `shared/src/utils/tasksMarkdownReader.ts` — if API changes affect server-side markdown processing

**Dependencies**: PR 1

**AI-assistable**: Mostly — migration guide is well-documented. JSX runtime integration pattern is already proven in the existing branch.

**Acceptance criteria**: All CMS content renders correctly. Task pages display markdown properly. No console errors from unified pipeline. All unit tests pass.

---

### PR 5: SWR 1 → 2

**Scope**: Upgrade the data fetching library. SWR 2 works on React 18. Smallest of the upgrades — independent and low-risk.

**Packages**: `swr@2.x`

**Key files**:

- `web/src/lib/data-hooks/useUserData.test.tsx`
- Any custom SWR hooks or configurations
- `web/src/lib/storage/UserDataStorage.ts`

**Dependencies**: PR 1

**AI-assistable**: Fully — SWR 2 migration is well-documented and mostly backwards-compatible.

**Acceptance criteria**: All data-fetching tests pass. User data loads correctly on dashboard.

---

### PR 6: React 19 Prep — Type-Level + Behavioral Changes

**Scope**: Prepare the codebase for React 19 with changes that are backwards-compatible on React 18. Combines type-level changes (RefObject, ReactNode) with behavioral prep (config lazy eval, nested component extraction). These can be separate PRs if preferred.

**Packages**: `@types/react@19.x`, `@types/react-dom@19.x`

**Key files** (~35 files):

Type-level:

- Components with `RefObject<T>` → `RefObject<T | null>`: `usePreviewRef.tsx`, `useIntersectionOnElement.ts`
- Components with `JSX.Element` → `ReactNode` return types: `CountryDropdown.tsx`, `ArrowTooltip.tsx`, `Content.tsx`, and others
- Children normalization: `Content.tsx`, `ContextualInfoLink.tsx`

Behavioral:

- Config lazy evaluation: `ChecklistTag.tsx`, `getEmployerAccessQuarterlyDropdownOptions.ts`, `getNextSeoTitle.ts`, `sendChangedNonEssentialQuestionAnalytics.ts`, `dataFormErrorMapContext.ts`, `configContext.ts`
- Nested component extraction: `njeda.tsx` (`FundingsHeader`), `cms.tsx` (function ordering)
- Shared types: `shared/src/types/types.ts` (`profileFieldsFromConfig` → `getProfileFieldsFromConfig`)
- `shared/src/contexts/defaultConfig.ts` — new default config file (consider auto-generating)

**Dependencies**: PRs 2-5 (all blocking library upgrades must be complete)

**AI-assistable**: Mostly — type changes are mechanical. Config lazy eval is grep-find-replace. `defaultConfig.ts` approach needs human decision (hand-written vs. generated).

**Acceptance criteria**: All existing unit tests pass. TypeScript compilation succeeds with `@types/react@19`. Config initialization works correctly in SSG builds. No runtime behavior changes.

---

### PR 7: React 18 → 19 Core Upgrade

**Scope**: The actual React version bump. By this point, all blocking libraries have been upgraded (MUI 7, rehype-react 8, CSSTransition replacement, SWR 2) and the codebase has been prepped (types, config lazy eval). This PR should be **minimal** — only the changes that are strictly required by the React 18→19 runtime differences.

**Packages**: `react@19.x`, `react-dom@19.x`, `eslint-plugin-react-hooks@7.x`

**Key files**:

- `web/package.json`, `package.json` — version bumps
- `web/src/components/njwds-extended/GenericButton.tsx` — ref-as-prop
- `web/src/components/njwds-extended/PrimaryButton.tsx` — explicit ref forwarding
- `web/src/lib/data-hooks/useFormContextHelper.ts` — async submission handling
- `web/src/lib/data-hooks/useUnsavedChangesGuard.ts` — ref sync via useEffect
- `web/src/pages/_app.tsx` — auth flow updates (careful: keep minimal, don't over-fix)
- `web/src/pages/onboarding.tsx` — flushSync for navigation, page range validation
- Test files — async wrapping with `act`/`waitFor` (~60 files)

**Dependencies**: PR 6 (and transitively PRs 1-5)

**AI-assistable**: Partially — test wrapping is systematic (AI). Auth flow and `GenericTextField` need human judgment. **Do NOT carry forward the `updateOnBlur` pattern from the existing branch without independent validation.**

**Acceptance criteria**: All unit tests pass under React 19. All Cypress E2E tests pass (no skipped suites). No `setTimeout(0)` workarounds — fix root causes or file follow-up tickets with clear justification.

**Human judgment required**:

- `GenericTextField.tsx` — decide whether `updateOnBlur` is needed or if a simpler approach works under React 19
- `_app.tsx` — auth gating should be clean, not triple-checked
- Tax ID component consolidation — separate product behavior changes from React 19 compatibility

---

### PR 8: Build Tooling (Turbopack, Standalone Output, Docker)

**Scope**: Modernize the build and deployment pipeline. This is largely independent and can be started in parallel with the other work stream, though final validation needs the React 19 build.

**Packages**: None (configuration changes)

**Key files**:

- `web/next.config.js` → `web/next.config.ts` — full rewrite
- `WebApp.Dockerfile` — multi-stage build with standalone output
- `docker-compose.yml` — updated for new image structure
- `.github/actions/package-webapp-docker/action.yml` — CI changes (**fix the `env >` security issue**)
- `scripts/healthcheck-web.sh` — new health check script
- `web/scripts/copy-vendor-assets.ts` — replaces webpack CopyPlugin
- `web/scripts/patch-njwds-css.ts` — Turbopack CSS compatibility patch
- `web/package.json` — build script changes

**Dependencies**: PR 7 (needs React 19 for full validation, but can be developed in parallel)

**AI-assistable**: Partially — config conversion is mechanical. Docker/ECS health check validation requires infrastructure access and human testing.

**Acceptance criteria**: `next build` succeeds. Docker image builds and starts. Health check endpoint responds. Application loads in browser from Docker container. **CI does NOT dump all env vars into `.env.production`.**

---

### PR 9: Storybook 7 → 10

**Scope**: Upgrade Storybook and ALL addons to consistent major versions.

**Packages**: `storybook@10.x`, `@storybook/react@10.x`, `@storybook/nextjs@10.x`, and ALL addons to compatible 10.x versions

**Key files**:

- `web/package.json` — version bumps (ensure all addons are on compatible versions)
- `.storybook/` configuration files (if any need updates)
- `web/tsconfig.json` — `stories` exclusion already added

**Dependencies**: PR 3 (needs MUI 7 for component rendering)

**AI-assistable**: Mostly — Storybook provides automated migration CLI (`npx storybook@latest upgrade`). Verify addon compatibility.

**Acceptance criteria**: `yarn storybook` starts without errors. All stories render. **All addon versions are on the same major version** (no mixing 7.x/8.x/9.x/10.x/11.x).

---

### Dependency Graph

```
PR 1 (Test infra)
  ├─ PR 2 (CSSTransition — replace react-transition-group)
  ├─ PR 3 (MUI 5→7 + Date Pickers)
  │    └─ PR 9 (Storybook 7→10)
  ├─ PR 4 (unified/rehype ecosystem)
  ├─ PR 5 (SWR 1→2)
  └─────────────────────────────────┐
       After PRs 2-5 are all merged:
            └─ PR 6 (React 19 prep: types + behavioral)
                 └─ PR 7 (React 18→19 core)  ← the actual upgrade
                      └─ PR 8 (Build tooling / Docker)
```

**Key insight**: PRs 2, 3, 4, and 5 can be worked on **in parallel** after PR 1 merges. They all remove blockers that prevent React 19 from working. PR 9 (Storybook) can also proceed in parallel once PR 3 (MUI) merges. Only after all blocking libraries are upgraded (PRs 2-5) do we proceed to PR 6 (React 19 prep) and PR 7 (the actual flip).

This ordering means:

- **React 19 is the last runtime change**, not the first
- Each PR can be validated with 100% passing tests on React 18
- If any single upgrade causes test failures, the root cause is isolated to that upgrade
- The React 19 PR itself will be much smaller and cleaner, with fewer surprises

---

## 6. Salvage Checklist

### Files to copy directly from the `react-19` branch

| File                      | Path                                               | Notes                                           |
| ------------------------- | -------------------------------------------------- | ----------------------------------------------- |
| CSSTransition component   | `web/src/components/transitions/CssTransition.tsx` | Well-designed, test-aware. Copy as-is for PR 2. |
| Accessible queries helper | `web/test/helpers/accessible-queries.ts`           | New async-safe query helpers. Copy for PR 1.    |
| Config mock helper        | `web/test/mock/mockUseConfig.ts`                   | Copy for PR 1.                                  |
| Vendor asset copy script  | `web/scripts/copy-vendor-assets.ts`                | Copy for PR 8.                                  |
| NJWDS CSS patch script    | `web/scripts/patch-njwds-css.ts`                   | Copy for PR 8.                                  |
| Health check script       | `scripts/healthcheck-web.sh`                       | Copy for PR 8 but **fix `netstat` dependency**. |

### Documentation to keep on `main`

These 3 files should be merged to `main` immediately (cherry-pick or manual copy) as they are valuable regardless of approach:

| File                 | Path                                             | Value                                                                       |
| -------------------- | ------------------------------------------------ | --------------------------------------------------------------------------- |
| PR review audit      | `docs/react-19/pr-review-react-19-upgrade.md`    | Comprehensive file-by-file audit, P0/P1/P2 punchlist, PR discussion summary |
| Patterns explanation | `docs/react-19/react-19-patterns-explanation.md` | Detailed catalog of React 19 patterns with rationale                        |
| Index                | `docs/react-19/README.md`                        | Navigation and maintenance guide                                            |

### Patterns to replicate (with source references)

These patterns are well-documented in the existing branch. Use the branch as reference, but re-implement cleanly:

| Pattern                                                    | Example source file                                   | Target PR | AI-assistable? |
| ---------------------------------------------------------- | ----------------------------------------------------- | --------- | -------------- |
| MessageChannel polyfill for jsdom                          | `web/setupTests.js`                                   | PR 1      | Yes (copy)     |
| matchMedia mock enhancement                                | `web/setupTests.js`                                   | PR 1      | Yes (copy)     |
| JSX runtime for rehype-react                               | `web/src/components/PureMarkdownContent.tsx`          | PR 4      | Yes            |
| `RefObject<T>` → `RefObject<T \| null>`                    | `web/src/lib/cms/helpers/usePreviewRef.tsx`           | PR 6      | Yes            |
| `JSX.Element` → `ReactNode` return types                   | `web/src/components/CountryDropdown.tsx`              | PR 6      | Yes            |
| Children normalization for arrays                          | `web/src/components/ContextualInfoLink.tsx`           | PR 6      | Yes            |
| Module-level config → function-level                       | `web/src/components/ChecklistTag.tsx`                 | PR 6      | Yes            |
| `profileFieldsFromConfig` → `getProfileFieldsFromConfig()` | `shared/src/types/types.ts`                           | PR 6      | Yes            |
| Nested component extraction                                | `web/src/pages/njeda.tsx`                             | PR 6      | Yes            |
| ref-as-prop (replacing forwardRef)                         | `web/src/components/njwds-extended/GenericButton.tsx` | PR 7      | Yes            |
| Test async wrapping (`act` + `waitFor`)                    | `web/src/components/OutageAlertBar.test.tsx`          | PR 7      | Yes            |
| Stable ID via `useState`                                   | `web/src/components/ExpandCollapseString.tsx`         | PR 7      | Yes            |
| useEffect for ref sync                                     | `web/src/lib/data-hooks/useUnsavedChangesGuard.ts`    | PR 7      | Yes            |
| Async submission with ref guard                            | `web/src/lib/data-hooks/useFormContextHelper.ts`      | PR 7      | Partially      |
| `flushSync` for navigation                                 | `web/src/pages/onboarding.tsx`                        | PR 7      | Partially      |

### What NOT to carry forward

| Item                                                               | Why                                                                     | Where it exists                                                                                                                                |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `setTimeout(0)` workarounds (~15 instances)                        | Masks root causes. Find structural fixes instead.                       | `DeferredOnboardingQuestion.tsx`, `FocusTrappedSidebar.tsx`, `CrtkStatus.tsx`, `CheckEligibility.tsx`, `XrayStatus.tsx`, `loading.tsx`, others |
| `GenericTextField` `updateOnBlur` pattern                          | 276-line refactor with unclear necessity. Validate from scratch.        | `web/src/components/GenericTextField.tsx`                                                                                                      |
| `nativeInputValueSetter` Cypress hack                              | Intrusive React internals access. Fix the input handling instead.       | `web/cypress/support/helpers/helpers.ts`                                                                                                       |
| Arbitrary `cy.wait()` timing delays                                | Non-deterministic. Use retry-based assertions.                          | `web/cypress/e2e/group_1_onboarding/onboarding-as-foreign-business.spec.ts`, helpers                                                           |
| Blanket console error/warn suppression                             | Hides genuine regressions. Use an allowlist.                            | `web/setupTests.js`                                                                                                                            |
| `env > web/.env.production` in CI                                  | Security vulnerability. Write specific vars explicitly.                 | `.github/actions/package-webapp-docker/action.yml`                                                                                             |
| Mixed Storybook addon versions                                     | Incomplete migration. Start fresh with consistent versions.             | `web/package.json`                                                                                                                             |
| ~134 "React 19:" code comments                                     | Noise. Code should be self-explanatory; link to patterns doc if needed. | Throughout codebase                                                                                                                            |
| `defaultConfig.ts` hand-written 2,637 lines                        | Should be auto-generated from a schema or JSON source.                  | `shared/src/contexts/defaultConfig.ts`                                                                                                         |
| Dead code (`form-helpers.ts`, unused queries)                      | Never imported, adds confusion.                                         | `web/cypress/support/helpers/form-helpers.ts`, `web/test/helpers/accessible-queries.ts` (unused exports)                                       |
| `@smithy/node-http-handler` 4→2 downgrade                          | Unexplained. Validate compatibility before reintroducing.               | `api/package.json`                                                                                                                             |
| Dependency downgrades (`supertest`, `sass-loader`, `style-loader`) | Unexplained. Use current versions and fix any actual incompatibilities. | Various `package.json` files                                                                                                                   |

---

## 7. Immediate Next Steps

1. **Preserve the branch**: Do not delete `react-19`. Tag it for reference: `git tag archive/react-19-attempt-1 react-19`

2. **Merge documentation to main**: Cherry-pick or manually copy the 3 `docs/react-19/` files to `main`. They are valuable regardless of approach.

3. **Begin PR 1** (test infrastructure): Copy `setupTests.js` changes and `accessible-queries.ts` from the branch. This is low-risk, high-value, and unblocks everything else.

4. **Begin PR 2** (type-level prep): Mechanical changes AI can handle. Can run in parallel with PR 1 review.

5. **Plan PR 4 carefully**: The React 19 core upgrade is the critical path. Before starting, explicitly decide:
   - How to handle `GenericTextField` (keep simple, validate updateOnBlur independently if needed)
   - How to handle `_app.tsx` auth flow (single clean check, not triple)
   - Whether Tax ID product behavior changes belong in this PR or a separate one

6. **Set up CI validation**: Ensure the CI pipeline runs both unit tests and Cypress E2E on every PR. The acceptance criteria (100% pass rate) should be enforced automatically.
