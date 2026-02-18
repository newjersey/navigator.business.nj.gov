# PR review: React 19 upgrade (PR #12395)

PR: https://github.com/newjersey/navigator.business.nj.gov/pull/12395  
Commit under review: `a74fa46cfe`  
Scope: single-commit PR with a broad footprint (web + shared + api + content + build/deploy)

This document is intentionally long and includes:

- A catalog of React 19-aligned patterns that look consistent and “correct”
- Inconsistencies and opportunities to improve the branch before merge
- A prioritized punchlist (P0/P1/P2)
- A **file-by-file audit appendix for all changed files in the commit**
- An appendix of **all inline PR review threads** summarized in a table

---

## Executive summary

This PR upgrades the webapp ecosystem to React 19 and associated packages, including (from `web/package.json`):

- `react` / `react-dom`: **19.2.3**
- `next`: **16.1.5**
- `@mui/material`: **7.3.6**
- `unified`: **11.0.5** (with `rehype-react`: **8.0.0**)
- `@testing-library/react`: **16.3.1**

The upgrade is broad and touches:

- **Runtime:** Next.js config, standalone output packaging, Docker image build/runtime, ECS health checking
- **UI:** MUI 7 migrations, React 19 patterns (notably ref-handling), transitions, various components
- **Markdown/Content:** unified/rehype/remark pipeline upgrades
- **Config:** shared config composition, defaults, and “async-safe” access patterns
- **Tests:** Jest/jsdom setup, Testing Library patterns, flake mitigation for concurrent rendering

### How to refresh PR inputs (comments + review threads)

This doc incorporates PR discussion context. If you add new doc claims based on PR feedback, refresh the PR inputs first (and consider adding an “as of” timestamp).

Commands used most recently (run from repo root):

```bash
# Top-level PR conversation (comments + reviews)
gh pr view 12395 --json updatedAt,comments,reviews > /tmp/react19_pr_conversation.json

# Inline review threads (GraphQL; paginate if needed)
gh api graphql -f query='
query($owner:String!, $name:String!, $number:Int!, $after:String) {
  repository(owner:$owner, name:$name) {
    pullRequest(number:$number) {
      reviewThreads(first:100, after:$after) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          isResolved
          path
          line
          diffSide
          comments(first:50) {
            nodes { author { login } createdAt body }
          }
        }
      }
    }
  }
}
' -F owner='newjersey' -F name='navigator.business.nj.gov' -F number=12395 > /tmp/react19_review_threads_page1.json
```

### Known issues surfaced in PR discussion (must be addressed before merge)

From PR comments (dates in UTC):

- **ECS health checks blocking deploy** (2026-01-15): “we won't be able to deploy this until we get the ECS health checks working.”
- **Tax ID regression** (2026-01-23): new/legacy Tax ID input behavior is incorrect; reports of “splitting into 2 fields”, focus loss, and toggling input shape.
- **Formation flow input performance** (2026-01-23): fields feel slower; re-rendering may be exacerbated by state-sync changes.
- **Tax registration error** (2026-01-23): uncaught promise error in console (needs repro + stack trace capture).
- **Mgmt CMS hang** (2026-01-23): `/mgmt/cms` constant loading.
- **React DevTools showing components as “anonymous”** (2026-01-23): likely a build/runtime dev experience regression.

### Also called out: Unified upgrades / ticket tracking

A PR comment (2026-01-22) asks whether a unified-related ticket (Azure work item 7407) is addressed by this work. Since unified upgrades are part of this PR (`unified@11`, `rehype-react@8`, etc.), the PR description/docs should explicitly state:

- whether the ticket is considered satisfied by the dependency bump alone
- whether any additional unified migration work is still pending (and what would block closing it)

---

## Patterns that look aligned with React 19 best practices

This section is not “everything that changed”; it’s the set of patterns that appear repeatedly and should be treated as the _standard_ for the branch.

### 1) React 19 “ref as a prop” (replacing `forwardRef` where appropriate)

React 19 allows function components to receive `ref` in props (without `forwardRef`). The PR uses this pattern in:

- `web/src/components/njwds-extended/GenericButton.tsx`

Excerpt:

```tsx
export interface GenericButtonProps {
  // ...
  ref?: React.Ref<HTMLButtonElement>;
}

export function GenericButton(props: GenericButtonProps): ReactElement {
  return (
    <button
      // ...
      ref={props.ref}
    >
      {props.children}
    </button>
  );
}
```

**Why this is good:** It reduces `forwardRef` boilerplate and aligns with React 19’s direction.

**Notes / follow-up:**

- ESLint plugins/rules may lag behind this change (see inline thread requesting a chore ticket to track plugin support).
- If a wrapper component (e.g., `PrimaryButton`) wants to expose a `ref`, it must still _forward that `ref` down_ (as a prop) to the underlying DOM element. In this PR, `web/src/components/njwds-extended/PrimaryButton.tsx` forwards `ref` implicitly via `{...props}` spread into `GenericButton` (and `GenericButton` applies `ref={props.ref}`). This works today, but it’s easy to break during refactors; consider making it explicit (`ref={props.ref}`) or adding a small test to lock the behavior.

---

### 2) Unified + `rehype-react` integration updated for React 19 JSX runtime

React 19 + `rehype-react@8` prefers JSX runtime functions rather than `React.createElement`.

- `web/src/components/PureMarkdownContent.tsx`

Excerpt:

```tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";

// ...
.use(rehypeReact, {
  jsx,
  jsxs,
  Fragment,
  components: props.components,
})
```

**Why this is good:** It matches the modern JSX runtime and avoids React import coupling in pipeline code.

---

### 3) Async-safe config access: default config + optional chaining and guardrails

The PR introduces/leans on “default config first, then merge overrides later” to avoid build/test runtime failures when config values aren’t synchronously available.

Key files:

- `shared/src/contexts/configContext.ts`
- `shared/src/contexts/defaultConfig.ts` (large generated-ish defaults file)
- `web/src/pages/_app.tsx` (guarding SEO template usage with optional chains)

Excerpt from `web/src/pages/_app.tsx` showing “SEO-only compute” + optional chains:

```tsx
const isSeoPage = router && router.pathname.includes("/starter-kits");

const heroTitle = isSeoPage
  ? insertIndustryContent(
      config.starterKits?.hero?.title ?? "",
      pageProps.industry?.id,
      pageProps.industry?.name,
    )
  : "";
```

**Why this is good:** It prevents “undefined access” crashes during build, SSR/SSG, and tests when config loading is delayed or stubbed.

**Caution:** The type-safety story around `defaultConfig` and `ConfigType` is currently a review concern (see “Opportunities” below).

---

### 4) Test strategy: embrace async rendering + accessibility-first queries

This branch makes heavy test adjustments consistent with React 19 timing:

- Prefer `userEvent` (async) over many `fireEvent` patterns
- Prefer `findByRole`/`getByRole` and other accessible queries
- Add shared helpers:
  - `web/test/helpers/accessible-queries.ts`

Excerpt:

```ts
export const findButton = async (name: string | RegExp): Promise<HTMLElement> => {
  return await screen.findByRole("button", { name });
};
```

**Why this is good:** React 19’s scheduling and automatic batching makes sync assumptions less reliable; async queries align with actual UI behavior.

---

### 5) Jest/jsdom compatibility: MessageChannel + matchMedia modernization

React 19’s scheduling may rely on `MessageChannel`. MUI and other libs expect modern `matchMedia` APIs.

- `web/setupTests.js`

Patterns present:

- Provide a functional `MessageChannel` polyfill for jsdom
- Add `matchMedia` modern API stubs: `addEventListener/removeEventListener/dispatchEvent`

**Why this is good:** It makes the test environment closer to browser reality and avoids opaque React scheduling failures.

---

### 6) Avoid nested component definitions in render (and why it matters more under concurrency)

This repo appears to enforce a lint rule / convention against nested component definitions (inline review threads explicitly mention “no nested React components”).

This matters under React 19 because nested component definitions:

- create a new component identity on every render
- can trigger unnecessary unmount/remount cycles
- can amplify focus-loss issues in controlled inputs when combined with state-sync timing changes

Concrete example of fixing this pattern:

- `web/src/pages/njeda.tsx` moves `FundingsHeader` out of the page component.

**Why this is good:** It prevents accidental remounts and makes behavior more stable under concurrent rendering.

---

### 7) Replace incompatible transition library with an internal `CSSTransition`

React 19 and some legacy transition libs have compatibility issues (often related to `findDOMNode`). The PR adds:

- `web/src/components/transitions/CssTransition.tsx`

It includes:

- A production animation state machine (rAF + timeout)
- A test-mode bypass (no animation state machine in unit tests)

**Why this is good:** It removes a known compatibility pressure point, and makes unit tests less flaky by avoiding timing-based animation logic.

---

### 8) Next.js “standalone output” packaging + Docker runtime alignment

The PR moves toward Next’s `output: "standalone"` mode and adjusts CI/Docker accordingly:

- `web/next.config.ts` sets `output: "standalone"`
- `WebApp.Dockerfile` copies `.next/standalone` into the runtime image
- `.github/actions/package-webapp-docker/action.yml` writes `web/.env.production` for build-time env injection

**Why this is good:** Standalone output reduces runtime requirements and is a common deployment best practice for containerized Next apps.

**Caution:** Health checks and env-var consistency/type-safety still need tightening (see below).

---

### 9) Turbopack adjuncts: vendor assets + upstream CSS patching

This upgrade includes “build-system glue” that is easy to miss but will matter for stability:

- `web/scripts/copy-vendor-assets.ts` replaces webpack copy-plugin behavior by copying NJWDS assets from `node_modules` into `web/public/vendor` during build.
- `web/scripts/patch-njwds-css.ts` patches upstream NJWDS CSS to avoid Turbopack build failures caused by invalid pseudo-element selectors.

**Why this is good:** It makes the migration to Turbopack feasible without waiting on upstream fixes.

**Caution / follow-up:**

- Both scripts mutate build outputs (and one mutates `node_modules`) which can hide drift.
- Treat these as temporary compatibility layers: track upstream NJWDS fixes and remove the patch when safe.

---

## Inconsistencies / opportunities for improvement

This section focuses on issues that either:

- look like regressions, correctness risks, or
- create long-term maintenance burden / inconsistencies.

### 0) Treat bug reports as “spec”: align code changes to stated product rules

This PR includes a few functionality changes justified as “React 19 compatibility” but also called out as behavior changes in review threads / PR comments (notably Tax ID, date entry, and some onboarding flows). For this branch to be reviewable and safe:

- identify which changes are truly “compatibility” vs. product behavior changes
- ensure behavior changes are explicitly called out in the PR description and backed by tests

This is especially important because the PR is a single large commit, so reviewers will rely on _tests and docs_ to infer intent.

### A) React 19 timing “workarounds”: `setTimeout(..., 0)` and `flushSync` as pervasive escape hatches

The PR adds multiple `setTimeout` wrappers and a few `flushSync` calls.

Examples:

- `web/src/pages/loading.tsx` uses `setTimeout(() => setShowError(true), 0)`
- `web/src/components/data-fields/tax-id/DisabledTaxId.tsx` defers `setState` via `setTimeout(..., 0)`
- `web/src/pages/onboarding.tsx` uses `flushSync` around `setPage(...)`

**Concern:** These can become “cargo-cult” fixes. They may hide root causes like:

- state synchronization patterns that should instead be derived state
- effects firing during render phases due to conditional hooks, nested components, or wrong dependencies
- tests depending on overly synchronous assumptions

**Recommendation (branch standard):**

1. Treat `flushSync` as a _rare_ tool for DOM-dependent follow-up operations (focus management, measurement, router interactions) when the update must be flushed immediately.
2. Prefer structural fixes over `setTimeout(0)`:
   - move “sync state” into event handlers (not effects), when possible
   - remove nested component definitions that remount under concurrency
   - avoid updating state during render; rely on derived values
3. If `setTimeout(0)` is unavoidable, require:
   - a short explanation of the failure mode it prevents
   - a link to an upstream issue or a local repro note
   - a TODO/chore ticket if it’s expected to be temporary

This is consistent with reviewer feedback that these patterns can be “smell” / “antipattern” risks.

---

### A.1) Concrete timing-workaround examples worth revisiting

These are examples where the workaround is plausible but deserves scrutiny, either because it may be removable or because it may be masking a deeper issue:

- `web/src/components/tasks/TaxInput.tsx`: defers `setProfileData(business.profileData)` via `setTimeout(..., 0)` when `business` changes.
  - Risk: delayed sync could make the UI briefly show stale profile data, and could interact badly with controlled inputs (focus loss).
  - Likely alternative: update state synchronously on `business` change, and ensure any dependent effects don’t update state during render.
- `web/src/components/data-fields/tax-id/DisabledTaxId.tsx`: defers internal state syncing on profile changes.
  - Risk: show/hide state and displayed value can lag a render behind, producing flicker.
- `web/src/pages/loading.tsx`: defers `setShowError(true)` by 0ms when SAML error is detected.
  - This one is relatively low-risk, but it should still be documented as “why is this needed”.

If these timeouts were added to suppress “Cannot update a component while rendering a different component” warnings, that’s a signal to re-check the component tree for:

- state updates in render paths
- nested component definitions (forcing remounts)
- incorrect hook dependency arrays

---

### B) Comment policy drift: “React 19:” comments are pervasive and often redundant

There are many matches of `React 19:` across `web/`, `shared/`, and `api/`.

Quick way to quantify at any time:

```bash
rg -n "React 19:" web shared api -S
```

Some comments add real context; many appear to restate code or explain deleted code, which reviewers flagged as noise.

**Recommendation (branch standard):**

- Keep comments when they explain _why_ something is unusual, not _what_ the code does.
- Avoid comments explaining removed code or obvious refactors.
- For cross-cutting issues (test flake patterns, upstream library bugs), centralize explanation:
  - once in a helper/readme, and keep per-file comments short (“see doc X”).

---

### C) Tax ID behavior appears inconsistent with expected product rules (potential P0 regression)

**Status: TBD (product intent + repro needed).**

PR comments describe incorrect behavior:

- “rendering the legacy tax input when inputting a tax id for the first time”
- “split into 2 fields on the first character, losing focus, then becoming 1 field again”

Relevant code changes:

- `web/src/components/data-fields/tax-id/TaxId.tsx` now **always** renders `SingleTaxId` and deletes `SplitTaxId`.
- `web/src/components/data-fields/tax-id/SingleTaxId.tsx` changes numeric props from `{minLength: 12, maxLength: 12}` to `{minLength: 9, maxLength: 12}`.
- `web/src/components/data-fields/tax-id/TaxId.tsx` adds validation logic allowing 9-digit entries when DB value is empty or matches.

**Concern:** If the intended rule is “only allow legacy 9-digit inputs for users who already had a 9-digit value,” then allowing a new entry of 9 digits is incorrect.

**Recommendation (branch standard):**

- Define a single source of truth for Tax ID acceptance rules:
  - New entries: require 12 digits
  - Existing legacy: allow 9 digits only if DB-backed value is legacy
  - Masked values: treat carefully (don’t accidentally accept partial masks as valid)
- Cover with explicit tests:
  - new entry, DB empty → 9-digit should fail, 12-digit should pass
  - DB legacy 9-digit → 9-digit unchanged should pass
  - DB 12-digit → 9-digit should fail

**Verification steps:**

1. Repro in browser on this branch:
   - DB empty (new user) → enter 9 digits and 12 digits; confirm expected acceptance and that the field does not “flip” modes mid-entry.
   - DB-backed legacy 9-digit user → ensure unchanged 9-digit passes and editing behavior is stable.
2. Add/adjust tests in the highest-signal flow(s) that were reported (formation flow + filings-calendar flow).

---

### C.1) Related “controlled input” bugs reported in PR comments

Two separate comment threads indicate input weirdness that could share a root cause:

- **Tax ID field** behavior (splitting, losing focus, changing shape mid-entry)
- **Date of formation** input unfocus behavior (PR thread flags “unfocuses before typing is done”)

These are often caused by controlled inputs being re-mounted or having their `value`/`key` change unexpectedly due to state synchronization changes.

Specific suspect changes:

- Tax ID now always renders `SingleTaxId` and accepts 9–12 digits (`numericProps={{ minLength: 9, maxLength: 12 }}`), which may interact with formatting and masking (`formatTaxId`) during typing.
- MUI X date pickers were migrated to the new slots/props API and now set `enableAccessibleFieldDOMStructure={false}` in multiple places (see below).

---

### D) MUI X date picker migration: verify focus/typing behavior and “accessible DOM structure” settings

**Status: TBD (reported focus/unfocus issue needs repro + decision).**

Several date pickers were migrated to the updated MUI X DatePicker API:

- `web/src/components/data-fields/DateOfFormation.tsx`
- `web/src/components/tasks/business-formation/business/FormationDate.tsx`
- `web/src/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitDatePicker.tsx`
- `web/src/components/tasks/cigarette-license/fields/CigaretteSalesStartDate.tsx`

Common migration patterns:

- Replace `renderInput` with `slots.textField` + `slotProps.textField`
- Replace `inputFormat` with `format`
- Set `enableAccessibleFieldDOMStructure={false}`

**Concern:** A PR thread reports date input focus/unfocus weirdness. Disabling the accessible DOM structure can change the internal field composition and event handling, and slot-based wrapping with a custom `GenericTextField` can introduce controlled input timing issues.

**Recommendation (P0/P1):**

- Re-test typing behavior in each date field in the browser (not just tests).
- If focus loss remains:
  - try removing `enableAccessibleFieldDOMStructure={false}` unless there’s a documented reason it’s required
  - ensure the custom text field wrapper is not changing keys or props that cause remounts

**Verification steps:**

1. Repro in browser: type a full month/year (or full date where applicable) without losing focus.
2. If focus loss happens, capture:
   - which picker (`DateOfFormation`, `FormationDate`, etc.)
   - whether it happens only in test/CI mode (`DesktopDatePicker`) vs non-test (`DatePicker`)
   - a short screen recording or console trace
3. Decide (document in code): whether `enableAccessibleFieldDOMStructure={false}` is a temporary compatibility flag (because of `GenericTextField` assumptions) or a permanent choice.

---

### E) Config type-safety and "defaults" approach needs automation

Inline review notes and reviewer feedback call out:

- `defaultConfig.ts` can’t easily be typed as `ConfigType` due to circular dependencies
- `configContext.ts` uses casting (`as unknown as ConfigType`) in ways that bypass compile-time safety
- Reviewer concerns: “if that check isn’t automated… there’s no accountability”

**Recommendation (branch standard):**

Add an automated check (one or more of):

1. A `shared` unit test that asserts `getMergedConfig()` satisfies invariants:
   - all required top-level keys exist
   - no “empty object” configs override defaults
2. A build-time type test (TS “compile-only” step) in a non-circular layer, e.g.:
   - generate a `ConfigType` shape declaration file and validate defaultConfig against it
3. A script that derives defaults from the content JSON sources and generates `defaultConfig.ts` deterministically.

---

### F) Build-time env injection: correctness + type-safety + security posture

New approach:

- CI writes `env > web/.env.production` during build step (`.github/actions/package-webapp-docker/action.yml`)
- Next config explicitly whitelists env keys via `next.config.ts` `env: { ... }`

Review concern:

- “If we add or remove environment variables, it would be ideal if this somehow failed and shouted at us to update them here.”

**Recommendation (branch standard):**

- Add a CI validation step that asserts:
  - `web/.env-template` (or a canonical env list) matches `next.config.ts` env keys
  - `package-webapp-docker/action.yml` approach is consistent with that canonical list
- Prefer generating the env whitelist from a typed TS module so drift is harder.

**Security note:** Ensure sensitive env values do not leak into logs/artifacts. The action currently writes all env vars to a file in the build context; even if that layer doesn’t ship, it may still be stored in build cache depending on CI runner configuration.

---

### G) ECS health check: current implementation looks fragile (likely deploy blocker)

**Status: TBD (must be verified in standalone runtime + ECS).**

New files/patterns:

- `scripts/healthcheck-web.sh` runs `netstat` and curls `http://localhost:3000/healthz`
- `WebApp.Dockerfile` adds Docker `HEALTHCHECK` using that script

Concerns:

- Alpine images may not include `netstat` by default.
- `/healthz` must exist and respond quickly in the standalone server.
- The PR author explicitly noted difficulty diagnosing ECS health checks.

**Recommendation (P0):**

- Confirm `/healthz` is implemented for the Next app (and works in standalone runtime).
- If not present, either:
  - implement it (simple pages/api route or middleware), or
  - change health check to a known fast endpoint (e.g. `/` with a lightweight check).
- Remove `netstat` dependency unless it’s guaranteed in the image.

**Verification steps:**

1. Build and run the runtime image locally and confirm:
   - container starts with `node server.js`
   - `/healthz` returns quickly and consistently
   - the `HEALTHCHECK` passes without relying on missing tools
2. Confirm the same behavior in ECS with the configured health check settings (task + target group, if applicable).

---

### H) Mgmt CMS constant loading: likely routing/auth/config interaction

**Status: TBD (repro + root cause needed).**

PR comment:

- “When going to mgmt/cms I am getting a constant loading... and just hangs”

Relevant changes:

- `web/src/pages/_app.tsx` rewires auth checks using `useEffect` + router readiness gating and “skip mgmt pages”

**Recommendation (P0 investigation):**

- Reproduce `/mgmt/cms` on the branch with browser console open.
- Confirm whether:
  - auth redirects are firing despite skip logic
  - config/context is missing or causing runtime error
  - Decap CMS scripts/assets pathing changed under standalone output

**Verification steps:**

1. Visit `/mgmt/cms` on the branch with console/network tabs open.
2. Capture:
   - any redirect chain (auth gating)
   - missing scripts/assets (404s) or CSP errors
   - runtime errors thrown during config load or CMS init
3. Decide whether the fix is:
   - routing/auth gating logic in `_app.tsx`
   - CMS asset pathing/build output changes under standalone mode
   - Config/context initialization ordering

---

### I) DevTools "anonymous components" regression: likely related to build settings or component definitions

**Status: TBD (dev experience regression needs confirmation + cause).**

PR inline thread reports:

- “React dev tools now renders all components as ‘anonymous’ rather than their name”

Likely suspects in this branch:

- build tooling changes (Turbopack/standalone output changes)
- changes to component definitions (anonymous arrow exports, HOC wrappers without `displayName`)
- minification/source-map toggles

**Recommendation (P1 investigation):**

- Confirm whether this happens in:
  - local `yarn dev` (Next dev server)
  - production build (`yarn build && yarn start` or standalone server)
- If primarily in dev:
  - verify Next/Turbopack settings and source maps
- If due to HOCs/forwardRef removals:
  - set `displayName` explicitly on wrapped components where devtools readability matters

---

### J) Dead code introduced with this PR

Several new files or code additions appear to be dead code:

1. **`web/cypress/support/helpers/form-helpers.ts`** — NEW file that exports Cypress form helpers, but is never imported by any spec file. Should be deleted or referenced.
2. **`web/test/helpers/accessible-queries.ts`** — NEW file defining multiple helper functions wrapping `screen.findByRole`/`screen.getByRole`, but only a small subset are used. The remaining helpers are effectively dead code today.
3. **`web/cypress/e2e/test-unused-content-access.spec.ts`** — Appears to be a debug/diagnostic test that may not belong in the permanent test suite.

**Recommendation:** Remove unused accessible-query helpers (or mark them as intentionally available for future use with an explicit comment). Delete `form-helpers.ts` if it has no consumers. Review whether the unused-content-access test is permanent or debug scaffolding.

---

### K) NavMenuItem hover regression

In `web/src/components/navbar/NavMenuItem.tsx`, the hover icon is wrapped in a `<span>` with `display: "none"` but there is no CSS hover rule to show it on `:hover`. The existing implementation effectively makes the hover icon invisible at all times.

**Recommendation:** Either add a CSS rule (e.g., `.nav-menu-item:hover .hover-icon { display: inline }`) or remove the hover icon markup entirely if it's no longer needed.

---

### L) CrtkSearchResult hardcoded CMS string

In `web/src/components/crtk/CrtkSearchResult.tsx`, the nested `CrtkContactInfo` component was correctly extracted to module scope, but in the process a CMS-configured string was replaced with a hardcoded value. This breaks CMS editability.

**Recommendation:** Pass the Config value as a prop to `CrtkContactInfo` instead of hardcoding the string.

---

### M) PrimaryButton ref forwarding bug

`web/src/components/njwds-extended/PrimaryButton.tsx` declares `ref?: React.Ref<HTMLButtonElement>` and forwards it **implicitly** via `{...props}` spread into `GenericButton`. `GenericButton` then applies it to the underlying `<button>` (`ref={props.ref}`), so a parent-supplied `ref` should work.

The concern here is not correctness today; it’s maintainability: this is implicit and easy to accidentally break if `PrimaryButton` later destructures props (e.g., `const { ref, ...rest } = props`) or replaces the spread.

**Recommendation:** Either explicitly pass `ref={props.ref}` to `GenericButton`, or remove `ref` from PrimaryButton's Props if ref forwarding is not intended.

---

### N) Security: CI env injection dumps all secrets

`.github/actions/package-webapp-docker/action.yml` uses `env > web/.env.production` to write environment variables into the build context. This command dumps **all** CI environment variables, including secrets, into a file that becomes part of the Docker build context. Even though the file is only used at build time and the runtime image may not include it, the file exists in build cache and intermediate layers.

**Recommendation:**

- Replace `env >` with explicit writes of only the required variables.
- Or use `printenv | grep NEXT_PUBLIC_` to limit exposure.
- Audit Docker build cache cleanup to ensure `.env.production` doesn't persist in pushed layers.

---

### O) Test pattern inconsistency: fireEvent vs userEvent

The branch moves toward `userEvent` for async-friendly testing, but many `fireEvent` calls remain. This creates a mixed testing style that may confuse contributors.

**Recommendation:** This doesn't need to be fixed before merge, but document the migration path:

- New tests should use `userEvent` + `findByRole` by default
- `fireEvent.change()` is acceptable for numeric inputs (upstream user-event bug #1286)
- Existing `fireEvent` calls should be migrated incrementally

Quick way to quantify impact at any time:

```bash
rg -n "fireEvent\\." web/test web/src -S
```

---

### P) Console.error/warn strictness removed in test setup

`web/setupTests.js` previously had logic to fail tests on unexpected `console.error` and `console.warn` calls. This strictness has been removed. While this reduces test noise from React 19's new warnings, it also hides genuine bugs.

**Recommendation:** After the initial React 19 stabilization period, re-add console.error strictness with an allowlist for known React 19 warnings. This prevents regressions from going unnoticed.

---

### Q) Cypress test stability concerns

- Some Cypress suites are skipped: `deadlinks.spec.ts`, `license-status-check.spec.ts`, `remove-business.spec.ts`. Each should have a tracking ticket.
- Many hardcoded `cy.wait()` calls in `web/cypress/support/helpers/helpers.ts`. These are fragile and will cause intermittent CI failures.
- Very long `waitFor` timeouts in some test files. These are risky and may mask real performance issues.
- **`nativeInputValueSetter`** pattern used for MUI numeric inputs in Cypress helpers — this is a workaround for React's synthetic event system and should be documented.

---

## Feedback from PR discussion (top-level comments)

This section summarizes the highest-signal PR comments so the branch doesn’t lose context.

- 2026-01-15 (seidior): deploy blocked by ECS health checks.
- 2026-01-22 (jphechter): unify upgrade ticket tracking (Azure item 7407) — confirm whether satisfied by this PR’s unified bump + pipeline changes.
- 2026-01-23 (somabadri): Tax ID input behavior incorrect; formation perf slower; tax registration console error.
- 2026-01-23 (cbrunefearless): `/mgmt/cms` constant loading/hang.
- 2026-01-23 (ashlsun): Tax ID field in filings-calendar flow behaves strangely (splits/loses focus); not seen on dev.

---

## Review-thread themes (inline comments)

There are many inline review threads on the PR. The highest-signal themes they reinforce:

1. **Comment hygiene:** reduce redundant “React 19:” commentary and remove “explain deleted code” comments.
2. **Timing workarounds skepticism:** reviewers called out `setTimeout` additions as potentially unnecessary; they want either a deeper explanation or a structural fix.
3. **Config confusion:** multiple threads question the “config loads async” framing and push for automated type-safety checks rather than manual “check it occasionally”.
4. **Deployment changes need guardrails:** env injection + standalone mode are reasonable, but reviewers asked for type-safety / drift detection.
5. **Behavior changes must be explicit:** Tax ID changes were flagged as product behavior changes and require careful verification.

See the full table in the final appendix.

## Prioritized punchlist

### P0 (merge/deploy blockers)

1. **Fix ECS health checks end-to-end**
   - Verify the runtime image can pass Docker/ECS health checks reliably.
   - Confirm `/healthz` exists or change to a known good endpoint.
   - Ensure any tooling required by `scripts/healthcheck-web.sh` exists in the image.

2. **Fix Tax ID correctness**
   - Align acceptance rules with product expectation (new entries must not accept legacy length).
   - Confirm Tax ID UI never “flips” between legacy/new modes during entry.
   - Add explicit tests for new vs legacy DB-backed behavior.

3. **Investigate tax registration uncaught promise error**
   - Identify the console error source and add a regression test if feasible.

4. **Fix `/mgmt/cms` hang**
   - Reproduce and diagnose whether auth gating, config, or asset loading is responsible.

### P1 (high value, reduces long-term cost)

1. **Make ref-as-prop forwarding explicit in wrappers**
   - `web/src/components/njwds-extended/PrimaryButton.tsx` currently forwards `ref` implicitly via `{...props}`. Make it explicit (`ref={props.ref}`) or add a small test so a ref-forwarding regression is caught.

2. **Reduce comment noise**
   - Remove redundant "React 19:" comments that restate code or deleted code.
   - Consolidate long rationales into a single doc or helper.
   - _(Done = no "React 19:" comments that merely restate code; audit with `rg "React 19:" web shared api` — currently ~134 occurrences.)_

3. **Automate config type-safety**
   - Add a CI/test-time check so `defaultConfig.ts` drift is caught immediately.

4. **Add env-var drift validation**
   - Ensure env whitelist in `web/next.config.ts` stays in sync with canonical env documentation/templates and CI packaging.

5. **Track ESLint/plugin updates for “ref as prop”**
   - Create a chore ticket and plan re-enabling any disabled rules once tooling catches up.

6. **Confirm react-email package changes didn't break preview/build**
   - The PR explicitly notes this wasn't tested.

7. **Fix CI env injection security**
   - Replace `env > web/.env.production` with explicit variable writes to avoid leaking secrets into build cache.

8. **Remove dead code**
   - Delete `web/cypress/support/helpers/form-helpers.ts` (never imported).
   - Remove 8 unused accessible-query helpers from `web/test/helpers/accessible-queries.ts`.
   - Evaluate `web/cypress/e2e/test-unused-content-access.spec.ts` — delete if debug-only.

9. **Fix NavMenuItem hover regression**
   - Either restore the CSS hover rule or remove the dead hover icon markup.

10. **Un-hardcode CrtkSearchResult CMS string**
    - Pass Config value as prop instead of hardcoding.

11. **Create tracking tickets for skipped Cypress suites**
    - `deadlinks.spec.ts`, `license-status-check.spec.ts`, `remove-business.spec.ts` are all skipped.

### P2 (quality/performance follow-ups)

1. **Profile formation input slowness**
   - Compare pre/post in React profiler; verify whether changes to shared field components (e.g., `GenericTextField`) increased renders.
   - _(Done = React Profiler trace attached to a ticket comparing pre/post render counts for GenericTextField-heavy forms.)_

2. **Standardize the "React 19 compatibility fixes" pattern**
   - Prefer helper-level abstractions over repeating workarounds per component.

3. **Migrate remaining fireEvent calls incrementally**

- Many `fireEvent` calls remain. Document the migration path (new tests use userEvent; fireEvent.change acceptable for numeric inputs per upstream bug).

4. **Re-add console.error strictness**
   - After stabilization, restore test setup console.error/warn assertions with an allowlist for known React 19 warnings.

5. **Replace hardcoded cy.wait() calls**
   - Hardcoded waits in Cypress helpers. Replace with proper Cypress retry-based assertions.

6. **Review very long waitFor timeouts**

- Overly long timeouts may mask real performance regressions. Standardize on the global Jest timeout or a shared constant.

7. **Audit @smithy/node-http-handler downgrade**
   - Package was downgraded from 4.x to 2.x. Confirm this doesn't break AWS SDK functionality.

8. **Remove redundant node_modules COPY in Dockerfile**
   - The runner stage copies node_modules but standalone mode should not need it.

---

## Appendix: File-by-file audit (all files in commit)

Each entry includes status (`M` modified / `A` added / `D` deleted / `R` renamed), and a specific summary of changes with flags where relevant.

### Audit highlights — flags only

**P0 flags:**

- ECS health check fragile / may block deploy (`healthcheck-web.sh:1026`)
- Tax ID business logic change — allows 9-digit entries for new users (`SingleTaxId.tsx:850`, `TaxId.tsx:853`)
- mgmt/cms constant loading hang (`_app.tsx:957`, `cms.tsx:961`)

**P1 flags:**

- Security: `.env.production` dumps all CI secrets (`action.yml:1006`)
- Dead code: never-imported Cypress helpers (`form-helpers.ts:801`), unused accessible-query helpers (`accessible-queries.ts:973`), possible debug spec (`test-unused-content-access.spec.ts:800`)
- PrimaryButton ref forwarding implicit via spread (`PrimaryButton.tsx:872`)
- CrtkSearchResult hardcoded CMS string during nested-component extraction (`CrtkSearchResult.tsx:829`)
- NavMenuItem hover icon permanently hidden — no CSS rule restores visibility (`NavMenuItem.tsx:860`)
- Skipped Cypress suites need tracking tickets (`cypress:670`)
- CheckEligibility 300ms timing workaround flagged as potentially incorrect (`CheckEligibility.tsx:905`)

**P2 flags:**

- @smithy/node-http-handler downgraded from 4.x to 2.x (`package.json:1001`)
- Runner stage copies node_modules unnecessarily with standalone mode (`WebApp.Dockerfile:999`)
- Stale dashboard personalization tab assignment (`dashboardHelpers.ts:838`)
- react-email templates untested after upgrade (`Header.tsx:1016`)
- setupTests console.error/warn strictness removed (`setupTests.js:1060`)

### web/cypress

- **`web/cypress/e2e/deadlinks.spec.ts`** — **M**. **SKIPPED** — entire suite wrapped in `describe.skip()`. Was a dead-links checker; needs tracking ticket for re-enablement. Some test logic was updated with `cy.wait()` calls.
- **`web/cypress/e2e/group_1_onboarding/onboarding-as-foreign-business.spec.ts`** — **M**. Adds hardcoded `cy.wait(...)` delays before interactions to compensate for React 19 async rendering. Follows branch pattern but fragile.
- **`web/cypress/e2e/group_5/license-status-check.spec.ts`** — **M**. **SKIPPED** — suite wrapped in `describe.skip()`. Adds `cy.wait()` calls and adjusts selectors for MUI 7 changes. Needs tracking ticket.
- **`web/cypress/e2e/group_5/remove-business.spec.ts`** — **M**. **SKIPPED** — suite wrapped in `describe.skip()`. Rewrites assertions for async rendering. Needs tracking ticket.
- **`web/cypress/e2e/group_5/taxclearance.spec.ts`** — **M**. Adds `cy.wait()` calls and `nativeInputValueSetter` pattern for MUI numeric inputs. Active suite, follows branch patterns.
- **`web/cypress/e2e/test-unused-content-access.spec.ts`** — **A**. **FLAG: Possible debug code.** New diagnostic spec that checks for unused CMS content. Evaluate whether this belongs in the permanent test suite.
- **`web/cypress/support/helpers/form-helpers.ts`** — **A**. **FLAG: DEAD CODE.** New file defining Cypress form helpers (`fillTextField`, `selectDropdown`, etc.) but never imported by any spec. Delete before merge.
- **`web/cypress/support/helpers/helpers-onboarding.ts`** — **M**. Minor additions for onboarding helper consistency.
- **`web/cypress/support/helpers/helpers.ts`** — **M** (+126/-46). Major expansion: adds `nativeInputValueSetter` pattern for MUI numeric inputs (React 19 synthetic events), hardcoded `cy.wait()` calls, updated selectors for MUI 7. Core Cypress helper file for the branch.

### web/src/components

- **`web/src/components/ArrowTooltip.tsx`** — **M**. Adds MUI 7 Popper `anchorEl` function pattern and optional chaining (`?.`) on theme access. Defensive against undefined theme values during SSR/build.
- **`web/src/components/ChecklistTag.tsx`** — **M**. Moves module-level `getMergedConfig()` call inside the component body (async-safe Config pattern). Converts static object to function-scoped construction.
- **`web/src/components/Content.tsx`** — **M**. React 19 children normalization: adds `Array.isArray` guard in `ListOrCheckbox` subcomponent since React 19 may pass bare values instead of single-element arrays. Also normalizes children in the internal `Link` component.
- **`web/src/components/ContextualInfoLink.tsx`** — **M**. React 19 children normalization: normalizes `props.children` to handle both string and array cases when extracting contextual info IDs.
- **`web/src/components/ContextualInfoPanel.test.tsx`** — **M**. Wraps assertions in `waitFor` for async rendering compatibility.
- **`web/src/components/CountryDropdown.tsx`** — **M**. `JSX.Element→ReactNode` in `renderOption` and `renderInput` Autocomplete callbacks. Consistent with all 6 dropdown components.
- **`web/src/components/DeferredOnboardingQuestion.tsx`** — **M**. Wraps `useEffect` state update in `setTimeout(0)` with cleanup. Defers question visibility tracking to avoid concurrent render warnings.
- **`web/src/components/ExpandCollapseString.tsx`** — **M**. Replaces inline `Math.random()` ID generation with `useState(() => Math.random().toString().slice(2))` for stable IDs across renders. Good React 19 pattern.
- **`web/src/components/FocusTrappedSidebar.tsx`** — **M**. Wraps `setTimeout(() => setFocusRef(...), 200)` in a cleanup pattern. **FLAG:** Reviewer suggested removing `showDiv` from useEffect deps instead of using setTimeout.
- **`web/src/components/FormationDateModal.tsx`** — **M**. Updates date picker integration for MUI X v7. Adjusts onChange typing and date value handling.
- **`web/src/components/GenericTextField.tsx`** — **M** (+130/-70). **MAJOR REFACTOR.** Introduces `updateOnBlur` prop enabling a local state buffer pattern: input value is held in local state during typing and synced on blur. Adds `onImmediateChange` and `onBlur` callback props. Refactors render-body mutations to `useMemo`/`const` derivations. Simplifies ref type to `ForwardedRef<HTMLDivElement>`. This is the core controlled input component — changes here affect all forms.
- **`web/src/components/LoadingPageComponent.tsx`** — **M**. Minor: `useRouter` import path change to `next/compat/router`.
- **`web/src/components/LoginEmailCheck.tsx`** — **M**. Removes unused import.
- **`web/src/components/OutageAlertBar.test.tsx`** — **M**. Significant test expansion: wraps assertions in `waitFor`, uses `findByRole` for async queries.
- **`web/src/components/PureMarkdownContent.tsx`** — **M**. Updates `rehype-react` integration to use JSX runtime (`jsx`, `jsxs`, `Fragment` from `react/jsx-runtime`) instead of `React.createElement`. Required for `rehype-react@8` + React 19.
- **`web/src/components/StateDropdown.tsx`** — **M**. `JSX.Element→ReactNode` in `renderOption` and `renderInput`. Consistent with CountryDropdown pattern.
- **`web/src/components/Task.tsx`** — **M**. Minor: useRouter import path change.
- **`web/src/components/TaskProgressCheckbox.tsx`** — **M**. Adds optional chaining on Config access. Defensive async-safe pattern.
- **`web/src/components/TaskProgressTagLookup.tsx`** — **M**. Converts module-level `TaskProgressTagLookup` constant to `getTaskProgressTagLookup()` getter function (async-safe Config pattern). Callers now invoke the function.
- **`web/src/components/UserDataErrorAlert.tsx`** — **M**. Moves Config access inside component body. Adds optional chaining on config values.
- **`web/src/components/crtk/BusinessActivities.tsx`** — **M**. Minor: removes unused import.
- **`web/src/components/crtk/CrtkPage.test.tsx`** — **M**. Migrates `getByText→findByText` for async rendering. Adds `waitFor` wrappers.
- **`web/src/components/crtk/CrtkSearchResult.tsx`** — **M**. Extracts nested `CrtkContactInfo` component to module scope. **FLAG: Hardcoded CMS string** — during extraction, a Config-driven string was replaced with a hardcoded value, breaking CMS editability.
- **`web/src/components/crtk/CrtkStatus.tsx`** — **M**. Moves module-level `Config` and `CrtkErrorLookup` inside component body (async-safe pattern). Wraps `useEffect` state init (`setFormValues`) in `setTimeout(0)` with cleanup. **FLAG:** Reviewer questioned whether setTimeout is necessary here — it's just initialization, not a render-during-render scenario.
- **`web/src/components/dashboard/BusinessStructurePrompt.test.tsx`** — **M**. Minor: removes `waitFor` wrapper, uses `getByTestId` instead of text-based query for Config-dependent content.
- **`web/src/components/dashboard/DashboardAlerts.test.tsx`** — **M**. Wraps assertions in `waitFor` for async rendering.
- **`web/src/components/dashboard/RemoveBusinessModal.tsx`** — **M**. Wraps `setBusinessName` in `setTimeout(0)` with cleanup in useEffect. Prevents concurrent render warnings when modal opens.
- **`web/src/components/dashboard/Roadmap.test.tsx`** — **M**. Migrates some interactions to `userEvent`, adds `waitFor` wrappers.
- **`web/src/components/dashboard/SectorModal.test.tsx`** — **M**. Migrates to `userEvent.click`, adds `waitFor` for async assertions.
- **`web/src/components/dashboard/SidebarCardFormationNudge.tsx`** — **M**. Adds optional chaining on Config access.
- **`web/src/components/dashboard/TwoTabDashboardLayout.tsx`** — **M**. Minor: import path adjustment.
- **`web/src/components/dashboard/dashboardHelpers.ts`** — **M**. Moves Config access inside function body. **FLAG:** PR thread reports a personalization tab assignment regression — may be related to this change.
- **`web/src/components/data-fields/DateOfFormation.tsx`** — **M** (+38/-26). Full MUI X DatePicker v7 migration: replaces `renderInput` with `slots.textField` + `slotProps.textField`, replaces `inputFormat` with `format`, adds `enableAccessibleFieldDOMStructure={false}`, casts `onChange` value from `unknown`. **FLAG:** PR thread reports date input unfocus-during-typing behavior.
- **`web/src/components/data-fields/ForeignBusinessTypeField.tsx`** — **M** (+26/-8). Uses `flushSync` to ensure checkbox state updates complete immediately before form submission validation. Adds `useRef` + `useEffect` to track latest value for validation callback (avoids stale closure). Has `eslint-disable react-hooks/refs` comment.
- **`web/src/components/data-fields/Industry.test.tsx`** — **M**. Adds `waitFor` wrappers for async rendering.
- **`web/src/components/data-fields/IndustryDropdown.tsx`** — **M**. `JSX.Element→ReactNode` in Autocomplete callbacks. Consistent pattern.
- **`web/src/components/data-fields/MunicipalityDropdown.tsx`** — **M**. `JSX.Element→ReactNode` in Autocomplete callbacks. Consistent pattern.
- **`web/src/components/data-fields/RadioQuestion.tsx`** — **M**. Wraps `useEffect` state update in `setTimeout(0)` with cleanup. Adds ref typing `<HTMLDivElement>(null)`.
- **`web/src/components/data-fields/Sectors.tsx`** — **M**. `JSX.Element→ReactNode` in Autocomplete callbacks. Consistent pattern.
- **`web/src/components/data-fields/non-essential-questions/NonEssentialQuestion.tsx`** — **M**. Wraps `setHasBeenSeen(true)` in `setTimeout(0)` with cleanup. Adds typed ref `useRef<HTMLDivElement>(null)`. Defers intersection observer tracking state update.
- **`web/src/components/data-fields/non-essential-questions/nonEssentialQuestionsHelpers.tsx`** — **M**. Same `setTimeout(0)` pattern for `setHasBeenSeen` as `NonEssentialQuestion.tsx`. Consistent.
- **`web/src/components/data-fields/tax-id/DisabledTaxId.test.tsx`** — **M**. Adds `waitFor` wrappers and adjusts assertions for deferred state.
- **`web/src/components/data-fields/tax-id/DisabledTaxId.tsx`** — **M** (+21/-15). Extracts nested `SimpleDiv` component to module scope (nested component extraction pattern). Wraps useEffect state sync in `setTimeout(0)` with cleanup. Adds typed ref.
- **`web/src/components/data-fields/tax-id/SingleTaxId.tsx`** — **M**. **FLAG: Business logic change.** Changes `numericProps` from `{minLength: 12, maxLength: 12}` to `{minLength: 9, maxLength: 12}`, allowing 9-digit Tax IDs. This is a product behavior change bundled with the React 19 migration.
- **`web/src/components/data-fields/tax-id/SplitTaxId.tsx`** — **D** (-161 lines). Entire split-field Tax ID input deleted. Was the legacy two-field (EIN prefix + suffix) implementation. Removal simplifies to single-field only.
- **`web/src/components/data-fields/tax-id/TaxId.test.tsx`** — **M** (+154/-237). Major test rewrite: migrates to `userEvent`+`findByRole`, removes SplitTaxId-related tests, adds new validation tests for 9-digit acceptance. Net code reduction.
- **`web/src/components/data-fields/tax-id/TaxId.tsx`** — **M** (+32/-40). **FLAG: Business logic change.** Removes `SplitTaxId` routing — now always renders `SingleTaxId`. Changes validation to accept both 9 and 12 digit values. Removes ref-based rendering. Adds `key` prop for remounting.
- **`web/src/components/data-fields/tax-id/TaxIdFormContext.ts`** — **D** (-5 lines). Removes form context used by deleted SplitTaxId.
- **`web/src/components/employer-rates/EmployerRates.test.tsx`** — **M**. Adds `waitFor` wrappers for async state updates.
- **`web/src/components/filings-calendar/FilingsCalendar.test.tsx`** — **M** (+119/-50). Major test expansion: migrates to `userEvent`, uses `findByRole`, adds `waitFor` wrappers.
- **`web/src/components/filings-calendar/FilingsCalendarAsList.tsx`** — **M**. Wraps `setNumberOfVisibleCalendarEntries` reset in `setTimeout(0)` with cleanup when `activeYear` changes.
- **`web/src/components/filings-calendar/tax-access/TaxAccess.test.tsx`** — **M**. Adds async wait for element before interaction.
- **`web/src/components/filings-calendar/tax-access/TaxAccessStepTwo.test.tsx`** — **M**. Migrates to `userEvent.click`.
- **`web/src/components/navbar/NavMenuItem.tsx`** — **M**. Refactors hover icon to use `sx` prop with `display: "none"`. **FLAG: Hover regression.** No CSS hover rule exists to set `display` back to visible on hover — the icon is permanently hidden.
- **`web/src/components/navbar/desktop/NavBarDesktop.tsx`** — **M** (+56/-26). Major refactor: consumes `createProfileMenuItems` and `createAddBusinessItems` pure functions from shared-submenu-components. Restructures menu rendering to pass hook values down instead of using hooks in child components.
- **`web/src/components/navbar/desktop/NavBarDesktopDropDown.tsx`** — **M** (+31/-18). Props destructuring refactor for React 19 concurrency casting. Adds MUI 7 Popper `anchorEl` function pattern. Ref typed with `| null`.
- **`web/src/components/navbar/desktop/NavBarDesktopVerticalLineDivider.tsx`** — **M**. Fix: changes `<hr>` to self-closing `<hr />`. Campground fix.
- **`web/src/components/navbar/mobile/NavBarMobile.test.tsx`** — **M**. Migrates to `userEvent`, adds `waitFor` wrappers.
- **`web/src/components/navbar/mobile/NavBarMobile.tsx`** — **M** (+34/-16). Restructures to consume pure function helpers from shared-submenu-components. Consistent with NavBarDesktop pattern.
- **`web/src/components/navbar/mobile/NavBarMobileAccountSlideOutMenu.test.tsx`** — **M**. Migrates to `userEvent`, adds `waitFor`.
- **`web/src/components/navbar/mobile/NavBarMobileQuickLinksSlideOutMenu.test.tsx`** — **M**. Migrates to `userEvent`, adds `waitFor`.
- **`web/src/components/navbar/shared-submenu-components.test.tsx`** — **M**. Minor test adjustment.
- **`web/src/components/navbar/shared-submenu-components.tsx`** — **M** (+54/-21). Extracts `createProfileMenuItems` and `createAddBusinessItems` as pure functions that receive hook values as arguments. Wrapper components (`ProfileMenuItem`, `AddBusinessItem`) call hooks and pass results. Fixes rules-of-hooks violation for conditionally called components.
- **`web/src/components/njwds-extended/CalendarButtonDropdown.tsx`** — **M**. Minor: MUI Popper `anchorEl` function pattern.
- **`web/src/components/njwds-extended/GenericButton.tsx`** — **M**. Removes `forwardRef` wrapper, accepts `ref` as a regular prop (React 19 ref-as-prop pattern). Explicitly passes `ref={props.ref}` to `<button>`. Clean implementation. Has `eslint-disable react-hooks/refs`.
- **`web/src/components/njwds-extended/PrimaryButton.tsx`** — **M**. Removes `forwardRef`, accepts `ref` in Props. **FLAG: Ref forwarding bug.** Relies on `{...props}` spread to forward ref to `GenericButton`, which is implicit and may not work correctly. Should explicitly pass `ref={props.ref}`.
- **`web/src/components/njwds-extended/PrimaryButtonDropdown.tsx`** — **M**. Minor: MUI Popper `anchorEl` function pattern.
- **`web/src/components/njwds-extended/SnackbarAlert.tsx`** — **M**. Minor: adds MUI `Slide` transition import adjustment.
- **`web/src/components/njwds-extended/ThreeYearSelector.tsx`** — **M**. Minor: import path adjustment.
- **`web/src/components/profile/ContactTabPanel.tsx`** — **M**. Ref typed with `| null`. Minor refactor.
- **`web/src/components/profile/PersonalizeYourTasksTab.tsx`** — **M** (+33/-33). Extracts `AccordionHeader` to module scope (nested component extraction). Moves Config access inside component body.
- **`web/src/components/profile/ProfileErrorAlert.tsx`** — **M**. Ref typed with `| null`. Adds optional chaining.
- **`web/src/components/profile/ProfileLinkToPermitsTabCallout.tsx`** — **M**. Wraps `useEffect` state update in `setTimeout(0)`.
- **`web/src/components/search/ConfigMatchList.tsx`** — **M**. Wraps `setExpanded(false)` in `setTimeout(0)` with cleanup when `props.matches` changes.
- **`web/src/components/search/MatchCollection.tsx`** — **M**. Wraps `setIsOpen(true)` in `setTimeout(0)` with cleanup when props change.
- **`web/src/components/search/MatchList.tsx`** — **M**. Wraps `setExpandedMatches(false)` in `setTimeout(0)` with cleanup when `props.matches` changes. All 3 search components use identical pattern.
- **`web/src/components/starter-kits/StarterKitsBody.tsx`** — **M**. Minor: import path adjustment.
- **`web/src/components/tasks/CheckElevatorRegistrationStatus.tsx`** — **M**. Moves Config access inside component body (async-safe pattern). Converts static lookup to function-scoped.
- **`web/src/components/tasks/CheckHousingRegistrationStatus.tsx`** — **M**. Same Config internalization pattern as CheckElevatorRegistrationStatus. Consistent.
- **`web/src/components/tasks/CheckLicenseStatus.tsx`** — **M**. Same Config internalization pattern. Consistent.
- **`web/src/components/tasks/ElevatorRegistrationTask.tsx`** — **M**. Minor: Config access adjustment.
- **`web/src/components/tasks/HotelMotelRegistrationTask.tsx`** — **M**. Minor: Config access adjustment.
- **`web/src/components/tasks/LicenseDetailReceipt.tsx`** — **M**. Minor: removes unused import.
- **`web/src/components/tasks/LicenseStatusHeader.tsx`** — **M**. Adds optional chaining on Config access.
- **`web/src/components/tasks/LicenseTask.test.tsx`** — **M** (+65/-53). Major test migration: `userEvent` + `findByRole` + `waitFor`. Tests key-based remounting pattern.
- **`web/src/components/tasks/LicenseTask.tsx`** — **M** (+37/-25). Replaces `useEffect` state sync with `useState` initializer (uses `business?.data ?? createEmpty()` pattern). Parent uses `key=` prop to remount when business changes. Good React 19 pattern.
- **`web/src/components/tasks/MultipleDwellingRegistrationTask.tsx`** — **M**. Minor: Config access adjustment.
- **`web/src/components/tasks/NaicsCodeInput.tsx`** — **M**. Moves Config access inside component body. Consistent async-safe pattern.
- **`web/src/components/tasks/RaffleBingoPaginator.test.tsx`** — **M**. Migrates to `userEvent` + `findByRole` + `waitFor`.
- **`web/src/components/tasks/TaxInput.tsx`** — **M**. Wraps `setProfileData(business.profileData)` in `setTimeout(0)` with cleanup in useEffect. **FLAG:** This defers syncing profile data, which could cause a brief flash of stale data.
- **`web/src/components/tasks/TaxTask.test.tsx`** — **M** (+63/-19). Migrates to `userEvent`, adds `waitFor` wrappers.
- **`web/src/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitWithValidation.test.tsx`** — **M**. Adds `waitFor` wrappers.
- **`web/src/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitDatePicker.tsx`** — **M** (+28/-23). Full MUI X DatePicker v7 migration: `renderInput→slots/slotProps`, `inputFormat→format`, `enableAccessibleFieldDOMStructure={false}`, `onChange` type cast. Consistent with all 4 date pickers.
- **`web/src/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitTimePicker.tsx`** — **M**. Minor: MUI TimePicker API adjustments.
- **`web/src/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificate.test.tsx`** — **M** (+181/-53). Major test expansion: migrates to `userEvent` + `findByRole`, adds comprehensive async assertions.
- **`web/src/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificate.tsx`** — **M** (+101/-82). Major refactor: uses `flushSync` for immediate state flush before save operations. Restructures step navigation with async/await. Significant timing-sensitive changes.
- **`web/src/components/tasks/anytime-action/tax-clearance-certificate/TaxClearanceSteps.test.tsx`** — **M**. Removes redundant test setup.
- **`web/src/components/tasks/anytime-action/tax-clearance-certificate/TaxClearanceSteps.tsx`** — **M** (+39/-5). Adds `setTimeout(0)` for step transitions. Uses `Date.now()` capture at click time instead of render time for timestamp accuracy. Adds `key` prop for TaxId remounting.
- **`web/src/components/tasks/anytime-action/tax-clearance-certificate/steps/CheckEligibility.tsx`** — **M**. Changes `saveTaxClearanceCertificateData` return type to `Promise<void>`. Wraps save+navigate in `setTimeout(...)` with try/catch. **FLAG:** This is a hardcoded timing workaround — reviewer flagged the surrounding rationale as potentially incorrect. Prefer a structural fix or document the exact repro/failure mode.
- **`web/src/components/tasks/anytime-action/tax-clearance-certificate/steps/Review.tsx`** — **M**. Uses `flushSync` for immediate state flush before tax clearance submission. Consistent with AnytimeActionTaxClearanceCertificate.
- **`web/src/components/tasks/business-formation/BusinessFormation.tsx`** — **M**. Converts `useRef<boolean>` to `useState<boolean>` for `getCompletedFilingApiCallOccurred` (React 19 concurrent mode requires reactive state for effect dependencies). Wraps `setStepIndex` in `setTimeout(0)` with cleanup.
- **`web/src/components/tasks/business-formation/BusinessFormationPaginator.test.tsx`** — **M**. Migrates to `findByRole` async queries.
- **`web/src/components/tasks/business-formation/billing/getCost.ts`** — **M**. Moves Config access inside function body.
- **`web/src/components/tasks/business-formation/business/BusinessDateValidators.tsx`** — **M**. Moves Config access inside function body.
- **`web/src/components/tasks/business-formation/business/FormationDate.tsx`** — **M** (+36/-33). Full MUI X DatePicker v7 migration. Consistent with DateOfFormation pattern.
- **`web/src/components/tasks/cannabis/CannabisPriorityStatusTask.test.tsx`** — **M** (+182/-65). Major test expansion. **FLAG:** Uses a hardcoded `waitFor` timeout — reviewer noted this is an "observed value, not calculated."
- **`web/src/components/tasks/cannabis/CannabisPriorityTypes.tsx`** — **M** (+20/-12). Adds `setTimeout(0)` for state updates in useEffect. Moves Config inside component.
- **`web/src/components/tasks/cigarette-license/CigaretteLicenseReview.test.tsx`** — **M**. Minor test adjustments.
- **`web/src/components/tasks/cigarette-license/CigaretteLicenseReview.tsx`** — **M**. Adds ref typing with `| null`.
- **`web/src/components/tasks/cigarette-license/CigaretteSignatures.test.tsx`** — **M**. Minor test adjustments.
- **`web/src/components/tasks/cigarette-license/Confirmation.test.tsx`** — **M**. Adds `waitFor` wrapper.
- **`web/src/components/tasks/cigarette-license/LicenseeInfo.test.tsx`** — **M**. Migrates to `userEvent`, adds `waitFor`. **FLAG:** PR thread requests chore ticket for tracking user-event numeric input bug workaround.
- **`web/src/components/tasks/cigarette-license/SalesInfo.test.tsx`** — **M**. Minor test adjustments.
- **`web/src/components/tasks/cigarette-license/fields/CigaretteSalesStartDate.tsx`** — **M** (+40/-34). Full MUI X DatePicker v7 migration. Removes inline `renderInput`, uses `slots/slotProps`. Adds `enableAccessibleFieldDOMStructure={false}`. Adds `dayjs` import for value wrapping. Consistent with all 4 date pickers.
- **`web/src/components/tasks/cigarette-license/fields/CigaretteSupplierDropdown.tsx`** — **M**. `JSX.Element→ReactNode` in Autocomplete callbacks. Consistent with all dropdown components.
- **`web/src/components/tasks/cigarette-license/fields/ContactInformation.test.tsx`** — **M**. Minor test adjustments.
- **`web/src/components/tasks/cigarette-license/fields/MailingAddress.test.tsx`** — **M**. Minor test adjustments.
- **`web/src/components/transitions/CssTransition.tsx`** — **A** (+118 lines). **NEW.** Custom replacement for `react-transition-group`'s `CSSTransition` (incompatible with React 19 due to `findDOMNode` removal). Implements rAF+timeout state machine for production animations. Test-mode bypass (no animation logic when `process.env.NODE_ENV === "test"`). Clean implementation.
- **`web/src/components/xray/Xray.test.tsx`** — **M**. Migrates to `userEvent`, adds `waitFor`.
- **`web/src/components/xray/Xray.tsx`** — **M**. Wraps state updates in `setTimeout(0)` with cleanup.
- **`web/src/components/xray/XrayStatus.test.tsx`** — **M**. Migrates to `userEvent`, adds `waitFor`.
- **`web/src/components/xray/XrayStatus.tsx`** — **M** (+35/-29). Moves module-level Config and status lookup objects inside component body (async-safe pattern). Converts `XrayStatusLookup` static object to getter function. Wraps useEffect state init in `setTimeout(0)`.

### web/src/contexts

- **`web/src/contexts/dataFormErrorMapContext.ts`** — **M** (+38/-29). Complete rewrite of form error context. Creates new `DataFormErrorMap` type and factory function. Restructures how form validation errors are tracked.

### web/src/lib

- **`web/src/lib/auth/signinHelper.ts`** — **M** (+11/-0). Adds retry logic with delay for sign-in. Wraps sign-in call in try/catch with 500ms delay retry.
- **`web/src/lib/cms/helpers/applyTheme.tsx`** — **M**. Adjusts MUI theme application for React 19 compatibility.
- **`web/src/lib/cms/helpers/usePreviewRef.tsx`** — **M**. Ref typed with `| null`.
- **`web/src/lib/cms/previews/NjedaPreview.tsx`** — **M**. Updates component import for renamed NJEDA page.
- **`web/src/lib/data-hooks/useFormContextHelper.ts`** — **M** (+25/-9). Significant refactor of form context helper. Changes how form state transitions work under React 19's batched updates.
- **`web/src/lib/data-hooks/useQueryControlledAlert.tsx`** — **M** (+10/-4). Wraps `setAlertIsVisible(true)` in `setTimeout(0)` in both delay and immediate code paths. Adds cleanup returns. Restructures control flow to avoid state-during-render.
- **`web/src/lib/data-hooks/useRoadmap.ts`** — **M**. Config access refactored inside hook body. PR thread notes author wanted to delete this hook but decided against it.
- **`web/src/lib/data-hooks/useUnsavedChangesGuard.ts`** — **M**. Adds cleanup for beforeunload event listener.
- **`web/src/lib/data-hooks/useUserData.test.tsx`** — **M**. Migrates to `userEvent` + `findByRole` + `waitFor`.
- **`web/src/lib/domain-logic/getEmployerAccessQuarterlyDropdownOptions.test.ts`** — **M**. Test adjustments for Config timing.
- **`web/src/lib/domain-logic/getEmployerAccessQuarterlyDropdownOptions.ts`** — **M**. Moves Config inside function body.
- **`web/src/lib/domain-logic/getNextSeoTitle.ts`** — **M**. Moves Config inside function body.
- **`web/src/lib/domain-logic/getProfileConfig.ts`** — **M**. Moves Config inside function body.
- **`web/src/lib/domain-logic/sendChangedNonEssentialQuestionAnalytics.ts`** — **M**. Moves Config inside function body.
- **`web/src/lib/storage/UserDataStorage.ts`** — **M** (+22/-6). Adds error handling around storage operations. Wraps JSON parsing in try/catch.
- **`web/src/lib/utils/helpers.ts`** — **M**. Adds `useMountEffect` helper using `setTimeout(0)` pattern for deferred mount effects.
- **`web/src/lib/utils/onboardingPageHelpers.ts`** — **M**. Moves Config inside function body.
- **`web/src/lib/utils/useIntersectionOnElement.ts`** — **M**. Changes ref parameter type from `RefObject<HTMLElement>` to `RefObject<HTMLElement | null>` (React 19 ref typing).

### web/src/pages

- **`web/src/pages/_app.tsx`** — **M** (+65/-41). **Major refactor.** Rewrites auth gating with `useEffect`-based flow, adds explicit skip for `/mgmt/*` pages. SEO template usage guarded with optional chaining (`config.starterKits?.hero?.title ?? ""`). Config provider restructured. **FLAG:** This is likely related to the reported `/mgmt/cms` hang issue.
- **`web/src/pages/account-setup.tsx`** — **M**. Updates for Config/router timing changes.
- **`web/src/pages/filings/[filingUrlSlug].tsx`** — **M**. Minor: Config access and import adjustments.
- **`web/src/pages/loading.tsx`** — **M**. Wraps `setShowError(true)` in `setTimeout(0)` when SAML error detected. Low risk but should document why it's needed.
- **`web/src/pages/mgmt/cms.tsx`** — **M**. Changes `JSX.Element→ReactNode` in registerPreview type. Reorders effect to define functions before `useMountEffect` (satisfies React rules). **FLAG:** PR thread reports constant loading — investigate auth/config interaction.
- **`web/src/pages/mgmt/deadurls.tsx`** — **M**. Config access and layout adjustments.
- **`web/src/pages/mgmt/unusedContent.tsx`** — **M**. Config access and layout adjustments.
- **`web/src/pages/njeda.tsx`** — **M** (+47/-51). Extracts nested `FundingsHeader` component to module scope (was defined inside render). Fixes typo in component name (`NJEDAFundingsOnboardingPaage→Page`). Converts `useEffect` state sync to `useState` initializer for `shouldCloseModal`. Good React 19 patterns throughout.
- **`web/src/pages/onboarding.tsx`** — **M** (+52/-19). Uses `flushSync` for page navigation state updates to ensure DOM is flushed before route transitions. Removes foreign business type early return. Makes `completeOnboarding` async with await. Significant timing-sensitive changes.

### web/src/scripts

- **`web/src/scripts/webflow/webflowSync.test.js`** — **M**. Adds `waitFor` wrappers for async assertions.

### web/test

- **`web/test/helpers/accessible-queries.ts`** — **A** (+174 lines). **NEW.** Defines accessible-query helper functions wrapping `screen.findByRole`/`screen.getByRole`. **FLAG:** Only a small subset are used; the rest are dead code today.
- **`web/test/helpers/helpers-formation.tsx`** — **M**. Migrates formation test helpers to `userEvent` + `findByRole`. Adjusts for async state.
- **`web/test/helpers/helpers-renderers.tsx`** — **M** (+10/-0). Adds `mockConfig` injection to test renderers so Config is available during tests.
- **`web/test/mock/mockUseConfig.ts`** — **A** (+8 lines). New mock for `useConfig` hook. Returns `getMergedConfig()` lazily.
- **`web/test/mock/mockUseUserData.ts`** — **M**. Extends mock with additional async-compatible properties.
- **`web/test/mock/withStatefulUserData.tsx`** — **M**. Adds async-compatible state management to stateful user data wrapper.
- **`web/test/pages/account-setup.test.tsx`** — **M**. Migrates to `userEvent` + `findByRole` + `waitFor`.
- **`web/test/pages/cms.test.tsx`** — **M**. Migrates to async queries.
- **`web/test/pages/loading.test.tsx`** — **M**. Migrates to async queries, tests `setTimeout(0)` SAML error path.
- **`web/test/pages/njeda.test.tsx`** — **M**. Updates for renamed component (`NJEDAFundingsOnboardingPage`).
- **`web/test/pages/onboarding/helpers-onboarding.tsx`** — **M** (+111/-36). Major rewrite of onboarding test helpers for async rendering. Migrates to `userEvent` + `findByRole`.
- **`web/test/pages/onboarding/onboarding-additional-business.test.tsx`** — **M**. Migrates to async test patterns.
- **`web/test/pages/onboarding/onboarding-foreign.test.tsx`** — **M** (+204/-129). Largest single test file change. Major rewrite for async rendering + ForeignBusinessTypeField `flushSync` changes.
- **`web/test/pages/onboarding/onboarding-owning.test.tsx`** — **M**. Migrates to async test patterns.
- **`web/test/pages/onboarding/onboarding-shared.test.tsx`** — **M**. Migrates to async test patterns.
- **`web/test/pages/onboarding/onboarding-starting.test.tsx`** — **M**. Migrates to async test patterns.
- **`web/test/pages/profile/profile-foreign.test.tsx`** — **M**. Migrates to async test patterns.
- **`web/test/pages/profile/profile-guest.test.tsx`** — **M**. Migrates to async test patterns.
- **`web/test/pages/profile/profile-helpers.tsx`** — **M**. Migrates profile test helpers to `findByRole` + `waitFor`.
- **`web/test/pages/profile/profile-owning.test.tsx`** — **M**. Migrates to async test patterns.
- **`web/test/pages/profile/profile-shared.test.tsx`** — **M**. Migrates to async test patterns.
- **`web/test/pages/profile/profile-starting.test.tsx`** — **M** (+308/-213). Major rewrite for async rendering.
- **`web/test/pages/taskUrlSlug.test.tsx`** — **M**. Migrates to async test patterns.

### Root

- **`WebApp.Dockerfile`** — **M** (+72/-11). **Complete rewrite.** From 2-stage to 4-stage build (deps → prod-deps → builder → runner). Switches to standalone runtime (`node server.js` instead of `next start`). Adds `HEALTHCHECK` directive. **FLAG:** Runner stage still copies `node_modules` which should be unnecessary with standalone mode — investigate removal to reduce image size.
- **`docker-compose.yml`** — **M** (+10/-0). Adds web service configuration for local development with standalone mode.
- **`package.json`** — **M** (+57/-54). Root workspace dependency bumps: React 19, Next 16, MUI 7, Testing Library 16, and supporting packages. **FLAG:** `@smithy/node-http-handler` downgraded from 4.x to 2.x — verify AWS SDK compatibility.
- **`yarn.lock`** — **M** (+3966/-4725). Lockfile changes from dependency bumps. Net reduction in locked packages.

### .github

- **`.github/actions/package-webapp-docker/action.yml`** — **M** (+8/-0). Adds `env > web/.env.production` step for build-time environment injection into standalone Next.js bundle. **FLAG: SECURITY CONCERN** — `env` command dumps ALL environment variables including secrets. Should be replaced with explicit variable writes.

### api

- **`api/cdk/package.json`** — **M**. Pins CDK dependencies for Renovate management. Campground fix.
- **`api/package.json`** — **M**. Pins API dependencies. Campground fix.
- **`api/wiremock/mappings/get-tax-clearance-success.json`** — **M**. Updates mock response for tax clearance API changes.

### api/src/functions

- **`api/src/functions/messagingService/reactEmail/components/Header.tsx`** — **M**. React 19 type adjustment for email template. **FLAG:** PR thread notes this wasn't tested.
- **`api/src/functions/messagingService/reactEmail/emails/welcomeEmailShortVersion.tsx`** — **M**. React 19 type adjustment. Same testing concern as Header.
- **`api/src/functions/messagingService/reactEmail/package.json`** — **M**. Bumps `@react-email/components` for React 19 compatibility.

### content

- **`content/package.json`** — **M**. Promotes `tsx` to prod dependency (needed for build scripts in standalone Docker context).

### scripts

- **`scripts/healthcheck-web.sh`** — **A** (+8 lines). **NEW.** Health check script using `netstat` + `curl http://localhost:3000/healthz`. **FLAG:** `netstat` may not exist in Alpine-based images. Author acknowledged this is "not my best work."

### shared

- **`shared/package.json`** — **M**. Version bump for shared package.

### shared/src/contexts

- **`shared/src/contexts/configContext.ts`** — **M** (+201/-220). **Major refactor.** Introduces `getMergedConfig()` function that merges `defaultConfig` with loaded content config. Alphabetizes config key list. Adds `as unknown as ConfigType` casting. Multiple PR threads discuss the type-safety concerns with this approach.
- **`shared/src/contexts/defaultConfig.ts`** — **A** (+2637 lines). **NEW.** Large generated defaults file providing fallback values for all config keys. Cannot be typed as `ConfigType` due to circular dependency. Acts as safety net when content config hasn't loaded yet.

### shared/src/static

- **`shared/src/static/loadAnytimeActionLicenseReinstatements.test.ts`** — **M**. Adds setup for Config availability. **FLAG:** Reviewer noted superfluous "React 19:" comment.
- **`shared/src/static/loadAnytimeActionLicenseReinstatements.ts`** — **M** (+34/-15). Restructures YAML loading to handle async config timing. Adds error handling. **FLAG:** Reviewer noted superfluous "React 19:" comment.
- **`shared/src/static/loadAnytimeActionTasks.test.ts`** — **M**. Same pattern as reinstatements test. **FLAG:** Superfluous comment.
- **`shared/src/static/loadAnytimeActionTasks.ts`** — **M** (+28/-13). Same restructuring as reinstatements loader. Consistent.
- **`shared/src/static/loadYamlFiles.ts`** — **M** (+21/-1). Adds error handling and defensive coding for YAML file loading.

### shared/src/types

- **`shared/src/types/types.ts`** — **M** (+5/-3). Adds/adjusts types for form error context changes.

### shared/src/utils

- **`shared/src/utils/tasksMarkdownReader.ts`** — **M** (+27/-14). Restructures markdown task reader for async-safe Config access. Adds error handling. **FLAG:** Reviewer noted superfluous "React 19:" comment.

### web (config/build)

- **`web/.dependency-cruiser.js`** — **M** (-4 lines). Removes dependency-cruiser rules that conflict with Turbopack module resolution.
- **`web/next.config.ts`** — **R** (+21/-54). **Renamed from `.js`.** Switches to TypeScript. Sets `output: "standalone"`. Adds Turbopack rules for markdown files. Replaces webpack config with explicit env whitelist. Adds `transpilePackages` for shared packages. Significantly simplified from webpack-era config.
- **`web/package.json`** — **M** (+45/-44). Major dependency updates: React 19.2.3, Next 16.1.5, MUI 7.3.6, MUI X Date Pickers 8.23.0, Testing Library 16.3.1, unified 11, rehype-react 8. Web code now uses an internal `CSSTransition` replacement rather than `react-transition-group` (even though the dependency remains in the workspace lockfiles). Turbopack config is present in Next config. **FLAG:** Storybook may need additional major version upgrades (PR thread).
- **`web/scripts/copy-vendor-assets.ts`** — **A** (+67 lines). **NEW.** Replaces webpack CopyPlugin. Copies NJWDS images and JS from `node_modules` to `public/vendor` for Turbopack builds. Clean implementation with error handling.
- **`web/scripts/patch-njwds-css.ts`** — **A** (+43 lines). **NEW.** Patches `@newjersey/njwds` CSS to fix invalid `::before--tile` and `::after--tile` pseudo-element syntax that causes Turbopack build failures. Temporary workaround — track upstream fix. **FLAG:** PR thread asks whether upgrading NJWDS would fix this.
- **`web/setupTests.js`** — **M** (+63/-26). **Major changes.** Adds `MessageChannel` polyfill (required for React 19 scheduler in jsdom). Modernizes `matchMedia` mock (adds `addEventListener`/`removeEventListener`/`dispatchEvent`). **FLAG: Removes console.error/warn strictness** — tests no longer fail on unexpected console errors. Increases `jest.setTimeout` from 10s to 30s. Adds global `useConfig` mock calling `getMergedConfig()` lazily.
- **`web/tsconfig.json`** — **M**. Minor: adjusts compiler options for React 19 JSX runtime.

---

## Appendix: Inline PR review threads (all threads)

| Resolved | Priority | Theme   | File                                                                                                              | Line | Commenters                           | Notes (first comment)                                                                                                                                                                                                                   |
| -------- | -------- | ------- | ----------------------------------------------------------------------------------------------------------------- | ---: | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ❌       | P0       | deploy  | `.github/actions/package-webapp-docker/action.yml`                                                                |    1 | seidior, hinzed1127, SirSamuelJoseph | Necessary changes to how we are hosting the site. To switch to Turbopack from Webpack, I've had to switch us to Next.js's ["standalone" hosting mode](https://nextjs.org/docs/pages/api-reference/config/next-config-js/output), which… |
| ❌       | —        | misc    | `api/cdk/package.json`                                                                                            |    1 | seidior                              | Campground rules: pinning dependencies so that Renovate can manage them appropriately.                                                                                                                                                  |
| ❌       | —        | test    | `api/jest.config.ts`                                                                                              |      | seidior                              | I'm not sure how necessary this is, but it helped address some test flakiness on my local machine with the new Docker-based DynamoDB Local setup we have going …                                                                        |
| ❌       | —        | misc    | `api/package.json`                                                                                                |    1 | seidior                              | More campgrounding of pinning dependencies.                                                                                                                                                                                             |
| ❌       | P1       | test    | `api/src/functions/messagingService/reactEmail/package.json`                                                      |    1 | seidior, hinzed1127                  | I did not test this; this may need additional testing to ensure we didn't break anything about creating or previewing the React Email template.                                                                                         |
| ❌       | —        | deploy  | `content/package.json`                                                                                            |   18 | seidior                              | Promoting `tsx` to a prod dependency allows us to run the build script without issues in circumstances where we only have prod dependencies, like in the `WebAp…                                                                        |
| ❌       | —        | deploy  | `docker-compose.yml`                                                                                              |   59 | seidior, hinzed1127                  | I figured it's just easier to work with and debug this if it's in our compose file.                                                                                                                                                     |
| ❌       | —        | test    | `jest.config.ts`                                                                                                  |      | seidior                              | This... does slow our tests down when running locally. And so does React 19. I hope they're able to speed things up in the future.                                                                                                      |
| ❌       | P0       | deploy  | `scripts/healthcheck-web.sh`                                                                                      |    1 | seidior                              | Not my best work, but it works. I'm struggling getting ECS health checks to work. I was hoping with these echo statements we would get some logging and diagnos…                                                                        |
| ❌       | P1       | config  | `shared/src/contexts/configContext.ts`                                                                            |   92 | seidior                              | The way that both Turbopack and React 19 work, Config will load async. So in order not to get build-time errors or error…                                                                                                               |
| ❌       | —        | config  | `shared/src/contexts/configContext.ts`                                                                            |  111 | seidior                              | For some reason, this list was not previously alphabetized. It's now easier to detect missing items.                                                                                                                                    |
| ❌       | —        | config  | `shared/src/contexts/configContext.ts`                                                                            |  113 | hinzed1127                           | this as the single lowercase config item is driving me crazy                                                                                                                                                                            |
| ❌       | P1       | config  | `shared/src/contexts/configContext.ts`                                                                            |  299 | seidior                              | I would prefer this to be `Partial<ConfigType>`, but I honestly don't know enough about Config to make this change.                                                                                                                     |
| ❌       | —        | config  | `shared/src/contexts/configContext.ts`                                                                            |  306 | seidior                              | This is not super critical, but it's a CYA step in case of SSG failure, so it should catch the most critical failures …                                                                                                                 |
| ❌       | P1       | type    | `shared/src/contexts/defaultConfig.ts`                                                                            |    6 | seidior, hinzed1127                  | I'd ideally want this to return an object of type `ConfigType` but that would create a circular dependency. Regardles…                                                                                                                  |
| ❌       | P1       | comment | `shared/src/static/loadAnytimeActionLicenseReinstatements.test.ts`                                                |   21 | hinzed1127                           | superfluous comment                                                                                                                                                                                                                     |
| ❌       | P1       | comment | `shared/src/static/loadAnytimeActionLicenseReinstatements.ts`                                                     |    9 | hinzed1127                           | superfluous comment                                                                                                                                                                                                                     |
| ❌       | P1       | comment | `shared/src/static/loadAnytimeActionTasks.test.ts`                                                                |   21 | hinzed1127                           | superfluous comment                                                                                                                                                                                                                     |
| ❌       | P1       | comment | `shared/src/static/loadAnytimeActionTasks.ts`                                                                     |    9 | hinzed1127                           | superfluous comment                                                                                                                                                                                                                     |
| ❌       | P1       | comment | `shared/src/utils/tasksMarkdownReader.ts`                                                                         |   70 | hinzed1127                           | superfluous comment                                                                                                                                                                                                                     |
| ❌       | —        | timing  | `web/cypress/e2e/group_1_onboarding/onboarding-as-foreign-business.spec.ts`                                       |    1 | hinzed1127                           | The comments adding context for adding `cy.wait` + disabling the rule are helpful, but do we actually have context on…                                                                                                                  |
| ❌       | P1       | comment | `web/cypress/e2e/group_5/taxclearance.spec.ts`                                                                    |   57 | hinzed1127                           | The code from heres feels self-explanatory, doesn't need the comments                                                                                                                                                                   |
| ❌       | P1       | comment | `web/cypress/support/helpers/helpers.ts`                                                                          |    1 | hinzed1127                           | most of the React 19 comments here give a little more context, but some prompt the same questions I commented about pr…                                                                                                                 |
| ❌       | P1       | deploy  | `web/next.config.ts`                                                                                              |   58 | seidior, hinzed1127                  | Without [output type of "standalone"](https://nextjs.org/docs/pages/api-reference/config/next-config-js/output), `turbopack` wouldn't work. It's not expressly …                                                                        |
| ❌       | —        | misc    | `web/package.json`                                                                                                |   17 | seidior                              | `turbopack` is now the default.                                                                                                                                                                                                         |
| ❌       | —        | misc    | `web/package.json`                                                                                                |   75 | seidior                              | This library is not compatible with React 19, so it's been removed, and custom CSSTransition code has been written.                                                                                                                     |
| ❌       | —        | misc    | `web/package.json`                                                                                                |   93 | seidior                              | _finally._                                                                                                                                                                                                                              |
| ❌       | P2       | misc    | `web/package.json`                                                                                                |  175 | seidior                              | There may be more upgrades needed as part of the Storybook major version upgrades. I didn't look too closely at this.                                                                                                                   |
| ❌       | —        | misc    | `web/package.json`                                                                                                |  181 | seidior                              | Strangely, we still need this as a dependency. Jest maybe?                                                                                                                                                                              |
| ❌       | —        | misc    | `web/scripts/patch-njwds-css.ts`                                                                                  |   10 | seidior, hinzed1127                  | Open question: do we upgrade njwds as part of this? Unclear if the newer version of NJWDS fixes this issue with this peculiar pseudo-selector.                                                                                          |
| ✅       | P2       | test    | `web/setupTests.js`                                                                                               |      | jennyverdeyen, seidior               | I think this console.error formatting logic has a bug: it replaces every %s placeholder with the same argument (args[1]), so messages with multiple placeholder…                                                                        |
| ❌       | P1       | timing  | `web/src/components/FocusTrappedSidebar.tsx`                                                                      |   22 | hinzed1127                           | Rather than wrapping in `setTimeout`, I think we can just remove `showDiv` from the useEffect` dependency array, e.g. ```tsx useEffect(() => { if (isOpen) { se…                                                                        |
| ❌       | —        | misc    | `web/src/components/PureMarkdownContent.tsx`                                                                      |    3 | seidior                              | The missing fixes that enable the `unified` upgrades.                                                                                                                                                                                   |
| ❌       | —        | test    | `web/src/components/crtk/CrtkPage.test.tsx`                                                                       |  349 | seidior, hinzed1127                  | This is an example of a switch from `getByText` to `findByText`, awaiting it as part of async rendering. Not everything needs to switch to it right away for th…                                                                        |
| ❌       | P1       | comment | `web/src/components/crtk/CrtkSearchResult.tsx`                                                                    |   42 | seidior                              | Linting error: no nested React components.                                                                                                                                                                                              |
| ❌       | P1       | timing  | `web/src/components/crtk/CrtkStatus.tsx`                                                                          |   89 | hinzed1127                           | Is this `setTimeout` actually needed? This doesn't even appear to be for updates, just initialization purposes                                                                                                                          |
| ❌       | —        | test    | `web/src/components/dashboard/BusinessStructurePrompt.test.tsx`                                                   |   55 | seidior                              | Because Config could be empty or it could have the value, it's better that we use `getByTestId`, although an async method would be better.                                                                                              |
| ❌       | —        | timing  | `web/src/components/dashboard/RemoveBusinessModal.tsx`                                                            |   56 | seidior, hinzed1127                  | This is an example of a concurrency fix in React 19, and part of what allows it to be performant with batching updates. The component itself could be mounted 0…                                                                        |
| ❌       | P2       | bug     | `web/src/components/dashboard/dashboardHelpers.ts`                                                                |   13 | SirSamuelJoseph                      | [bug] Not sure if it's in this file but there appears to be a change to when the "personalize" tab gets assigned. Onboarding as an existing business in guest m…                                                                        |
| ❌       | P0       | bug     | `web/src/components/data-fields/DateOfFormation.tsx`                                                              |   62 | SirSamuelJoseph                      | [bug] Not sure it is tied specifically to this file, but trying to type in the date of formation field gives weird behavior that unfocuses before typing is don…                                                                        |
| ❌       | —        | misc    | `web/src/components/data-fields/DateOfFormation.tsx`                                                              |  120 | seidior                              | MUI upgrade means the API has changed for upgraded components.                                                                                                                                                                          |
| ❌       | P0       | bug     | `web/src/components/data-fields/tax-id/TaxId.tsx`                                                                 |      | seidior                              | I _think_ this is just a simplification, that a ref wasn't needed here to make this component work, but this would need testing. I don't see anything in [the R…                                                                        |
| ❌       | P0       | bug     | `web/src/components/data-fields/tax-id/TaxId.tsx`                                                                 |  100 | seidior, hinzed1127                  | Behavior change [approved by](https://njcio.slack.com/archives/C05BCE7A2KB/p1769635675095649?thread_ts=1769632208.133609&cid=C05BCE7A2KB) @ClassActHarris on 20…                                                                        |
| ❌       | P1       | comment | `web/src/components/filings-calendar/tax-access/TaxAccess.test.tsx`                                               |  208 | hinzed1127                           | This comment should probably just be removed. The [recommended priority order for queries in Testing Library](https://testing-library.com/docs/queries/about/#p…                                                                        |
| ❌       | —        | type    | `web/src/components/navbar/desktop/NavBarDesktopDropDown.tsx`                                                     |   31 | seidior                              | Normally we don't destructure `props`. However, because we need to cast this later because of the concurrency changes in React 19 (line 71), we might as well d…                                                                        |
| ❌       | —        | misc    | `web/src/components/navbar/desktop/NavBarDesktopVerticalLineDivider.tsx`                                          |    1 | seidior                              | Campgrounding. Not sure how this accident got past code review, but regardless, it's fixed now.                                                                                                                                         |
| ❌       | —        | type    | `web/src/components/njwds-extended/GenericButton.tsx`                                                             |   28 | seidior                              | This is a major change in React 19. You don't have to worry about `forwardRef`, because you can [access ref as a prop](https://react.dev/blog/2024/12/05/react-…                                                                        |
| ❌       | P1       | misc    | `web/src/components/njwds-extended/GenericButton.tsx`                                                             |   76 | seidior, hinzed1127                  | That said, the `react-hooks` eslint rule has not been made aware of this change, or it hasn't landed yet, so we have to disable that rule temporarily so it doe…                                                                        |
| ❌       | P1       | comment | `web/src/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificate.test.tsx` |    1 | seidior, hinzed1127                  | I hear you saying "that's a lot of inline comments and we don't really do inline comments unless it's necessary". I'd love feedback like that one way or the ot…                                                                        |
| ❌       | —        | timing  | `web/src/components/tasks/anytime-action/tax-clearance-certificate/TaxClearanceSteps.tsx`                         |  156 | seidior                              | I'm guessing this isn't really a React 19-relevant thing. Instead, `Date.now()` gets evaluated on most recent render rather than at the current time that the u…                                                                        |
| ❌       | P1       | timing  | `web/src/components/tasks/anytime-action/tax-clearance-certificate/steps/CheckEligibility.tsx`                    |   79 | hinzed1127                           | This seems like a hallucination. I don't see any mention of blur in the React 19 upgrade guide and this part seems wrong: > increased from 100ms to 300ms it ap…                                                                        |
| ❌       | P2       | test    | `web/src/components/tasks/cannabis/CannabisPriorityStatusTask.test.tsx`                                           |  642 | seidior                              | The timeout value here is an observed value, not a calculated value. (aka it's enough to make the test pass when tests are running concurrently on my machine, but open …                                                               |
| ❌       | P1       | test    | `web/src/components/tasks/cigarette-license/LicenseeInfo.test.tsx`                                                |   41 | hinzed1127                           | - [ ] create chore for tracking and eventually updating this                                                                                                                                                                            |
| ❌       | —        | misc    | `web/src/components/tasks/cigarette-license/fields/CigaretteSalesStartDate.tsx`                                   |   83 | seidior                              | It appears like the date picker's syntax has changed significantly.                                                                                                                                                                     |
| ❌       | —        | misc    | `web/src/components/transitions/CssTransition.tsx`                                                                |    1 | seidior, hinzed1127                  | The CSS Transition library that we've been using isn't compatible with React 19, so... we replaced it with our own.                                                                                                                     |
| ❌       | —        | misc    | `web/src/lib/data-hooks/useRoadmap.ts`                                                                            |   44 | seidior, hinzed1127                  | I really wanted to use this upgrade as an excuse to get rid of this hook, but I decided not to.                                                                                                                                         |
| ❌       | —        | comment | `web/src/pages/njeda.tsx`                                                                                         |   41 | seidior                              | No nested React components are allowed anymore.                                                                                                                                                                                         |
| ❌       | —        | misc    | `web/src/pages/njeda.tsx`                                                                                         |   86 | seidior                              | campground rules, was somehow missed in the code review                                                                                                                                                                                 |
| ❌       | P1       | comment | `web/src/pages/onboarding.tsx`                                                                                    |  423 | hinzed1127                           | we should definitely not be adding comments to explain deleted code                                                                                                                                                                     |
| ❌       | P1       | config  | `web/test/helpers/helpers-renderers.tsx`                                                                          |  135 | jphechter, seidior                   | I thought I understood why this was added based on some of the context you provided with how the config is being used, but now I'm not so confident. Specifical…                                                                        |
