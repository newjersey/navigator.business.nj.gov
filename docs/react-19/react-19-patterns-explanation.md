# React 19 Patterns in This Codebase (Diataxis: Explanation)

This document explains _why_ we changed certain patterns during the React 19 upgrade (PR `#12395`, branch `react-19`, commit `a74fa46cfe`), and how developers can write React 19-aligned code on `main` while the upgrade branch is still in flight.

It is structured in two parts:

- **Part A** is for right now -- while the `react-19` branch has not yet merged. It tells you what to do (and avoid) on `main` so your code does not conflict with the upgrade.
- **Part B** is the post-merge reference catalog. It documents every major pattern change with real before/after examples from this codebase, explains why each change was necessary, and calls out gotchas.

---

## Why React 19 changes ripple through our app

React 19 is not a drop-in version bump. Its changes to scheduling, batching, and concurrent rendering propagate through the entire stack:

1. **Automatic batching everywhere.** React 18 batched state updates only inside event handlers. React 19 batches them inside `setTimeout`, promises, and native event handlers too. Code that assumed synchronous intermediate renders between two `setState` calls can now see different behavior.

2. **Stricter concurrent-mode invariants.** React 19 enforces that you cannot update a component while rendering a different component. Effects that synchronously set state on mount can trigger warnings or infinite loops that did not exist in React 18.

3. **Library ecosystem breakage.** Major dependencies -- MUI (v5 to v7), `react-transition-group`, `rehype-react`, `@testing-library/user-event`, MUI X Date Pickers -- all released breaking changes that coincide with React 19 support. Upgrading React means upgrading (or replacing) these libraries.

4. **`@types/react` changes.** The TypeScript types for React 19 change `RefObject<T>` to require an explicit `| null` and shift many signatures to prefer `ReactNode` where callers may return strings/fragments/null. This branch also standardizes on the “ref-as-prop” pattern (see Practice 1) to reduce wrapper boilerplate.

5. **jsdom gaps.** React 19's internal scheduler uses `MessageChannel`. jsdom does not provide it. Tests that worked under React 18 hang or crash without polyfills.

6. **Next.js standalone output.** The Next.js version paired with React 19 changes the deployment model to `output: "standalone"`, requiring Docker and CI pipeline changes.

The goal is not to "fight" React 19 with timers and workarounds. It is to write code that remains correct under async rendering.

---

## PART A: Pre-Merge Guidance

### Writing forward-compatible code on `main`

If you are working on `main` today, follow these rules so your code merges cleanly with the `react-19` branch.

**Checklist:**

- Do not add new `forwardRef` wrappers. Write components that accept `ref` directly in their props interface.
- Write tests using `userEvent` + `findByRole` + `waitFor`. Avoid synchronous `getByRole` for elements that appear after state updates.
- Do not add `setTimeout(0)` "fixes" without a documented justification comment explaining the exact failure mode.
- Guard config reads with optional chaining (`?.`) and nullish coalescing (`?? ""`) fallbacks.
- Do not define components inside render bodies. Hoist them to module scope.
- Use `ReactNode` instead of `JSX.Element` for component return types and callback return types.
- Do not call `getMergedConfig()` at module level. Call it inside functions or component bodies.
- Use `RefObject<T | null>` (not `RefObject<T>`) when typing `useRef<T>(null)`.

**Notes:**

- “Prefer ref-as-prop” is a branch standard to reduce wrapper boilerplate. Existing `forwardRef` components still work; avoid adding new ones unless a library API requires it.

### Things to avoid

These patterns will break or cause merge conflicts with the `react-19` branch:

- **Module-level side effects.** Calling `getMergedConfig()`, analytics initialization, or any function that depends on runtime state at the top level of a module. React 19's stricter initialization order means these may execute before the config is available.

- **Nested component definitions in hot paths.** Defining a component inside another component's render body causes it to remount on every render. React 19's batching makes the resulting flicker and state loss more visible.

- **Synchronous assumptions in tests.** Using `getByRole` when `findByRole` is needed. React 19 defers more updates, so elements may not be in the DOM synchronously after a click.

- **`jest.useFakeTimers()` in test files that use `findBy*` queries.** React 19's `findBy*` queries use internal `setTimeout`-based polling. Fake timers prevent those polls from firing, causing hangs.

- **`Array.isArray(props.children)` without normalization.** React 19 may not wrap a single child in an array. Always normalize: `const arr = Array.isArray(children) ? children : [children]`.

---

## PART B: Post-Merge Reference -- Complete Pattern Catalog

---

### Practice 1: ref-as-prop (replacing forwardRef)

**What changed:** React 19 allows function components to receive `ref` directly in their props, without wrapping in `forwardRef`.

**Why:** It removes ceremony, simplifies the type signature, and makes ref plumbing explicit in the props interface.

**Before (React 18):**

```tsx
import { forwardRef, Ref, ReactElement } from "react";

export const GenericButton = forwardRef(function GenericButton(
  props: GenericButtonProps,
  ref?: Ref<HTMLButtonElement>,
): ReactElement {
  return (
    <button ref={ref} onClick={props.onClick}>
      {props.children}
    </button>
  );
});
```

**After (React 19) -- `web/src/components/njwds-extended/GenericButton.tsx`:**

```tsx
import React, { ReactElement, useEffect, useRef, useState } from "react";

export interface GenericButtonProps {
  children?: React.ReactNode;
  onClick?:
    | (() => void)
    | ((event: React.MouseEvent) => Promise<void>)
    | ((event: React.MouseEvent) => void);
  isLoading?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
  // ...other props
}

export function GenericButton(props: GenericButtonProps): ReactElement {
  const widthRef = useRef<HTMLDivElement | null>(null);
  // ...

  /* eslint-disable react-hooks/refs */
  return (
    <button
      ref={props.ref}
      disabled={Boolean(props.isLoading)}
      onClick={props.isLoading ? undefined : props.onClick}
    >
      {props.children}
    </button>
  );
  /* eslint-enable react-hooks/refs */
}
```

**Files:** `web/src/components/njwds-extended/GenericButton.tsx`, `web/src/components/njwds-extended/PrimaryButton.tsx`

**Gotcha -- ESLint:** The `react-hooks` ESLint plugin does not yet understand ref-as-prop. You must add `/* eslint-disable react-hooks/refs */` around the JSX that uses `props.ref`. Track the plugin update and remove these comments when it ships.

**Gotcha -- implicit forwarding:** `PrimaryButton` declares `ref?: React.Ref<HTMLButtonElement>` in its `Props` interface but relies on `{...props}` spread to forward it to `GenericButton`:

```tsx
export function PrimaryButton(props: Props): ReactElement {
  return (
    <GenericButton {...props} className={`${colors[props.isColor]}`}>
      {props.children}
    </GenericButton>
  );
}
```

This works because `GenericButton` reads `props.ref` and attaches it to the `<button>`. But it is fragile -- if `GenericButton` ever destructures its props and omits `ref`, the forwarding silently breaks.

**Rule:** If you accept `ref` in your props interface, you must either forward it explicitly to a DOM element or to a child component that does. If you do not intend to forward it, do not accept it.

---

### Practice 2: unified + rehype-react JSX runtime

**What changed:** `rehype-react@8+` integrates with the modern `react/jsx-runtime` instead of the classic `React.createElement` API.

**Why:** The JSX runtime is what React's build tooling emits by default. Using `createElement` directly is the legacy path and can cause runtime mismatches with React 19's internal reconciler expectations.

**Before (React 18):**

```tsx
import React from "react";
import rehypeReact from "rehype-react";

// ...
.use(rehypeReact, { createElement: React.createElement })
```

**After (React 19) -- `web/src/components/PureMarkdownContent.tsx`:**

```tsx
import { ReactElement } from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import rehypeReact from "rehype-react";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export const PureMarkdownContent = (props: Props): ReactElement => {
  const markdown = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .use(customRemarkPlugin)
    .use(remarkRehype)
    .use(rehypeReact, {
      jsx,
      jsxs,
      Fragment,
      components: props.components,
    })
    .processSync(props.children).result;
  return <>{markdown}</>;
};
```

**File:** `web/src/components/PureMarkdownContent.tsx`

---

### Practice 3: Async-safe config (defaults + guards)

**What changed:** Under React 19's stricter initialization and concurrent rendering, config values accessed at module level or before hydration can be `undefined`.

**Pattern:** Compute derived values only when needed. Guard every access with optional chaining and nullish coalescing fallbacks.

**Before (crashes if config not loaded):**

```tsx
const heroTitle = insertIndustryContent(config.starterKits.hero.title, ...);
```

**After -- `web/src/pages/_app.tsx`:**

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

**After -- `web/src/components/ArrowTooltip.tsx`:**

```tsx
return {
  arrow: {
    color: theme.palette?.common?.black ?? "#000",
  },
  tooltip: {
    backgroundColor: theme.palette?.common?.black ?? "#000",
    fontSize: "1em",
    padding: ".5em .75em",
  },
};
```

**Guidance:**

- Prefer "compute only when needed" over computing eagerly and guarding later.
- Prefer `?? ""` for string templates, `?? 0` for numbers, `?? []` for arrays.
- See also Practice 13 (module-level config) for the pattern of moving `getMergedConfig()` calls inside functions.

---

### Practice 4: Testing -- userEvent + findByRole + waitFor

**What changed:** React 19's automatic batching means UI updates may be deferred. Synchronous queries (`getByRole`, `getByText`) can fail because the DOM has not yet updated.

**Pattern:** Default to async queries (`findByRole`, `findByLabelText`) and `userEvent` (which returns promises).

**Helper file -- `web/test/helpers/accessible-queries.ts`:**

```tsx
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

export const selectOptionByText = async (label: string, optionText: string): Promise<void> => {
  const input = await screen.findByLabelText(label);
  await userEvent.click(input);

  const listbox = await screen.findByRole("listbox");
  const option = within(listbox).getByRole("option", { name: optionText });
  await userEvent.click(option);
};
```

Additional helpers include `findCombobox`, `selectOptionByTestId`, `findAlert`, `findHeading`, `findCheckbox`, and `findRadio`.

**Before:**

```tsx
fireEvent.click(screen.getByText("Submit"));
expect(screen.getByTestId("result")).toBeInTheDocument();
```

**After:**

```tsx
await userEvent.click(await screen.findByRole("button", { name: "Submit" }));
expect(await screen.findByTestId("result")).toBeInTheDocument();
```

**Exception -- numeric/masked inputs:** There is a known upstream bug (testing-library/user-event#1286) where `userEvent.type()` causes infinite loops with React 19 + MUI controlled numeric inputs. Use `fireEvent.change` for these cases:

```tsx
// fireEvent for numeric inputs (userEvent causes infinite loop)
// See: https://github.com/testing-library/user-event/issues/1286
fireEvent.change(screen.getByLabelText("Tax ID"), {
  target: { value: "123456789012" },
});
```

**Rule:** Default to `userEvent` + `findByRole`. When you must use `fireEvent`, add a comment citing the upstream issue.

---

### Practice 5: jsdom polyfills (MessageChannel + matchMedia)

**What changed:** React 19 uses `MessageChannel` internally for scheduling state updates. jsdom does not provide `MessageChannel`. MUI 7 requires the modern `matchMedia` API (with `addEventListener`/`removeEventListener`), not just the deprecated `addListener`/`removeListener`.

**File -- `web/setupTests.js`:**

```js
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

// MUI 7 requires modern matchMedia API
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      media: "",
      onchange: null,
      // Old API (deprecated but still used by some libraries)
      addListener: function () {},
      removeListener: function () {},
      // Modern API (required by React 19 / MUI)
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () {
        return true;
      },
    };
  };
```

**Why the `MessageChannel` polyfill must be functional (not a no-op):** React 19's scheduler posts messages between `port1` and `port2` to defer work. If the polyfill swallows those messages, React never processes state updates, and tests hang on any `findBy*` query.

**Why `setImmediate` with `setTimeout` fallback:** `setImmediate` fires after the current I/O cycle but before `setTimeout(0)`, which better matches real browser `MessageChannel` behavior. The `setTimeout(0)` fallback exists for environments where `setImmediate` is not available.

**Also in `setupTests.js`:**

```js
// Increase global test timeout to handle resource contention during parallel test execution
jest.setTimeout(30000);

// Global mock for useConfig to provide Config to all tests
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

### Practice 6: flushSync -- use only when you must observe an update immediately

**What changed:** React 19 batches more aggressively. In some cases you need to synchronously flush a state update before performing a side effect that depends on it (focus management, routing, DOM measurement).

**When to use:** Immediately before focus, routing, or measurement that reads the updated DOM.

**Example -- `web/src/pages/onboarding.tsx`:**

```tsx
import { flushSync } from "react-dom";

const onBack = (): void => {
  if (page.current + 1 > 0) {
    setError(undefined);
    const previousPage = page.current - 1;
    // React 19: Use flushSync to ensure page navigation completes immediately
    // This prevents concurrent rendering from batching/delaying the state update
    flushSync(() => {
      setPage({
        current: previousPage,
        previous: page.current,
      });
    });
    routeToPage(previousPage); // Sees NEW page value
    headerRef.current?.focus(); // Focuses the correct element
  }
};
```

**Files using `flushSync`:**

- `web/src/pages/onboarding.tsx` -- page navigation + focus
- `web/src/components/data-fields/ForeignBusinessTypeField.tsx` -- checkbox state for form validation
- `web/src/components/tasks/anytime-action/tax-clearance-certificate/steps/Review.tsx` -- form step transitions
- `web/src/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificate.tsx` -- step navigation

**When NOT to use:**

- As a general "React 19 fix" for warnings. Fix the state design instead.
- Inside effects. `flushSync` inside `useEffect` is almost always wrong.
- For performance. `flushSync` defeats batching and can cause layout thrashing.

---

### Practice 7: setTimeout(0) -- avoid as default fix

**The pattern (used in many places):**

```tsx
// Before
useEffect(() => {
  setSomeState(value);
}, [dep]);

// After
useEffect(() => {
  const timeoutId = setTimeout(() => {
    setSomeState(value);
  }, 0);
  return () => clearTimeout(timeoutId);
}, [dep]);
```

**Why it exists:** React 19's batching/concurrency can surface "Cannot update a component while rendering a different component" warnings when state updates happen at the wrong time (often via effect-driven “sync from props” patterns). `setTimeout(0)` defers the update to the next event-loop task, outside the current render/effect turn.

**Concrete example -- `web/src/components/data-fields/tax-id/DisabledTaxId.tsx`:**

```tsx
useEffect(() => {
  const timeoutId = setTimeout(() => {
    setTaxIdDisplayStatus(getInitialShowHideStatus(state.profileData.taxId));
    updateSplitTaxId(state.profileData.taxId ?? "");
  }, 0);
  return (): void => clearTimeout(timeoutId);
}, [state.profileData.taxId, state.profileData.encryptedTaxId]);
```

**The canonical cleanup pattern:** Always assign to `const timeoutId` and return `() => clearTimeout(timeoutId)`. This prevents updates on unmounted components.

**Prefer structural fixes over `setTimeout(0)`:**

1. **Eliminate derived state duplication.** If `stateB` is always derived from `stateA`, compute it during render instead of syncing with an effect.
2. **Move updates to event handlers.** Event handlers are the natural place for state transitions. Effects that "sync" state are often misplaced event logic.
3. **Remove nested components that remount.** A component defined inside a render body gets a new identity every render, causing unmount/remount cycles that trigger the warning.
4. **Use `useState` initializer instead of `useEffect` sync.** Prefer initializing state from the source data and remounting with a `key` when the source changes, rather than “syncing” in an effect.

**If you must use `setTimeout(0)`:** Document the exact failure mode in a comment. Link to a repro or upstream issue if one exists.

---

### Practice 8: CSSTransition replacement (react-transition-group incompatible)

**What changed:** `react-transition-group` relies on patterns (string refs, `findDOMNode`) that React 19 removes or deprecates. It does not have a React 19-compatible release.

**Solution:** A custom drop-in replacement at `web/src/components/transitions/CssTransition.tsx`.

**Design:**

- **Production:** Uses `requestAnimationFrame` for enter transitions (two frames: mount, then activate) and `setTimeout` for exit timing. This synchronizes with browser repaints.
- **Test mode:** Skips the entire animation state machine. Renders directly in `*-enter-active` state (visible, final position). Animation correctness is verified by end-to-end tests, not unit tests.

**Implementation -- `web/src/components/transitions/CssTransition.tsx`:**

```tsx
import { ReactElement, ReactNode, useEffect, useRef, useState } from "react";

interface CSSTransitionProps {
  children: ReactNode;
  in: boolean;
  unmountOnExit?: boolean;
  timeout: number;
  classNames: string;
}

export const CSSTransition = (props: CSSTransitionProps): ReactElement | null => {
  const [shouldRender, setShouldRender] = useState(props.in);
  const [currentState, setCurrentState] = useState<"enter" | "exit" | "active" | null>(
    props.in ? "enter" : null,
  );
  const frameRef = useRef<number | undefined>(undefined);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isFirstMount = useRef(true);

  const isTestMode = process.env.NODE_ENV === "test";

  // Production: Full animation state machine with requestAnimationFrame
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

  // Test mode: Simple render without animation state machine
  if (isTestMode) {
    if (!props.in && props.unmountOnExit) return null;
    const baseClassNames = props.classNames.split(" ").filter(Boolean);
    const animationClass = baseClassNames[baseClassNames.length - 1];
    const otherClasses = baseClassNames.slice(0, -1).filter(Boolean);
    const finalClassName = [...otherClasses, `${animationClass}-enter-active`].join(" ");
    return <div className={finalClassName}>{props.children}</div>;
  }

  // Production mode
  if (!shouldRender) return null;
  return <div className={getClassNames()}>{props.children}</div>;
};
```

**Why a custom component instead of a library:** No maintained library offers React 19 compatibility with the exact API surface (`in`, `unmountOnExit`, `timeout`, `classNames`) that the codebase uses. Writing a small internal replacement was simpler than forking or patching `react-transition-group`.

---

### Practice 9: Next.js standalone output + Docker

**What changed:** This branch uses Next’s `output: "standalone"` mode. The build produces a `server.js` and a standalone output directory intended to run in a minimal runtime image (with the required runtime dependencies available).

**Three surfaces that must stay in sync:**

1. **`web/next.config.ts`** -- `output: "standalone"`, env variable whitelist, Turbopack rules:

```ts
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.md": { loaders: ["raw-loader"], as: "*.js" },
    },
  },
  transpilePackages: ["@businessnjgovnavigator/shared"],
  output: "standalone",
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    AUTH_DOMAIN: process.env.AUTH_DOMAIN,
    // ... full whitelist of env vars
  },
  // ...
};
```

2. **`.github/actions/package-webapp-docker/action.yml`** -- Creates `.env.production` at build time so that environment variables are baked into the standalone bundle.

3. **`WebApp.Dockerfile`** -- 4-stage build (deps, prod-deps, builder, runner):

```dockerfile
FROM node:24.12.0-alpine AS runner
WORKDIR /app
COPY --from=builder /app/web/.next/standalone ./
COPY --from=builder /app/web/.next/static ./web/.next/static
COPY --from=builder /app/web/public ./web/public

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

HEALTHCHECK --interval=10s --timeout=30s --start-period=90s --retries=5 \
  CMD /app/scripts/healthcheck-web.sh || exit 1

CMD ["node", "server.js"]
```

**Key change:** `CMD ["node", "server.js"]` replaces `CMD ["yarn", "start"]`. The runtime image starts the standalone server directly with Node.

**Why it matters:** Inconsistency across these three surfaces is a common source of "works locally, fails in ECS" bugs. If you add a new environment variable, update all three.

---

### Practice 10: MUI X date picker slots API

**What changed:** MUI X Date Pickers v7 removes `renderInput`, `inputFormat`, and `mask` props. They are replaced by `slots`, `slotProps`, and `format`.

**Before (MUI X v5):**

```tsx
<DatePicker
  inputFormat={"MM/YYYY"}
  mask={"__/____"}
  renderInput={(params) => <GenericTextField {...params} />}
  onChange={(newValue: DateObject | null) => { ... }}
/>
```

**After (MUI X v7) -- `web/src/components/data-fields/DateOfFormation.tsx`:**

```tsx
<Picker
  enableAccessibleFieldDOMStructure={false}
  views={["year", "month"]}
  format={"MM/YYYY"}
  disableFuture={!props.futureAllowed}
  openTo="year"
  disabled={props.disabled}
  value={dateValue}
  onChange={handleChange}
  slotProps={{
    textField: {
      inputProps: { placeholder: "__/____" },
      error: isFormFieldInvalid,
      sx: { svg: { fill: "#4b7600" } },
    },
  }}
  slots={{
    textField: (params: TextFieldProps): ReactElement => {
      return (
        <GenericTextField
          fieldName={fieldName}
          inputProps={params.InputProps}
          fieldOptions={{
            ...params,
            inputProps: { ...params.inputProps, placeholder: "__/____" },
            error: isFormFieldInvalid,
            sx: { svg: { fill: "#4b7600" } },
          }}
        />
      );
    },
  }}
/>
```

> **Common mistake:** setting `enableAccessibleFieldDOMStructure={false}` without filing a follow-up ticket to migrate to `true` once the custom slot wrapper supports the accessible DOM structure.

**Files:** `web/src/components/data-fields/DateOfFormation.tsx`, `web/src/components/tasks/business-formation/business/FormationDate.tsx`, `web/src/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitDatePicker.tsx`, `web/src/components/tasks/cigarette-license/fields/CigaretteSalesStartDate.tsx`

**Why `enableAccessibleFieldDOMStructure={false}`:** MUI v7's new accessible DOM structure splits the date input into multiple `<input>` elements (one per segment). Our custom `GenericTextField` slot component assumes a single input. Setting this to `false` preserves the legacy single-input structure. Plan to migrate to `true` once custom slot components are updated to handle the multi-input structure.

**Why `onChange` receives `unknown`:** MUI X v7 changed the type signature. Cast explicitly: `const d = date as DateObject | null`.

---

### Practice 11: RefObject<T | null> typing

**What changed:** React 19's `@types/react` changes `useRef<T>(null)` to return `RefObject<T | null>` instead of `RefObject<T>`. This is a type-level change -- no runtime behavior is different.

**Before:**

```tsx
const ref = useRef<HTMLDivElement>(null);
// Typed as RefObject<HTMLDivElement> -- .current is never null (lie)
```

**After:**

```tsx
const ref = useRef<HTMLDivElement>(null);
// Typed as RefObject<HTMLDivElement | null> -- .current can be null (truth)
```

> **Common mistake:** updating the `useRef<T>(null)` declaration but forgetting to update function signatures that accept the ref as a parameter — TypeScript will flag this at call sites, not at the declaration.

**Impact on function signatures:**

```tsx
// Before
export const useIntersectionOnElement = (
  element: RefObject<HTMLElement>,
  rootMargin: string,
): boolean => { ... };

// After -- web/src/lib/utils/useIntersectionOnElement.ts
export const useIntersectionOnElement = (
  element: RefObject<HTMLElement | null>,
  rootMargin: string,
): boolean => { ... };
```

**Files:** `web/src/components/tasks/cigarette-license/CigaretteLicenseReview.tsx`, `web/src/components/profile/ContactTabPanel.tsx`, `web/src/components/profile/PersonalizeYourTasksTab.tsx`, `web/src/components/profile/ProfileErrorAlert.tsx`, `web/src/lib/cms/helpers/usePreviewRef.tsx`, `web/src/lib/utils/useIntersectionOnElement.ts`, `web/src/components/profile/ProfileLinkToPermitsTabCallout.tsx`, `web/src/components/navbar/desktop/NavBarDesktopDropDown.tsx`

---

### Practice 12: JSX.Element to ReactNode migration

**What changed:** With updated React/MUI typings on this branch, many callback signatures and component return types are better expressed as `ReactNode` rather than `JSX.Element`. This reduces friction with libraries that allow strings/fragments/null and matches how React actually renders.

**Before:**

```tsx
renderOption={(...): JSX.Element => { ... }}
```

**After:**

```tsx
renderOption={(...): ReactNode => { ... }}
```

**Applies to:**

- MUI Autocomplete callbacks (`renderOption`, `renderInput`, `renderGroup`)
- Component return types
- CMS preview function return types
- Content component return types (e.g., `Content` returns `ReactNode` now)

**Files:** All dropdown components, `Content.tsx`, and various other components throughout the codebase.

---

### Practice 13: Module-level Config to function-level

**What changed:** Code that calls `getMergedConfig()` at module level (outside any function or component body) can crash under React 19 because the config may not be available when the module first loads.

**Before:**

```tsx
const Config = getMergedConfig();
const errorLookup = { NOT_FOUND: Config.task.errorText };

export const MyComponent = () => {
  // uses errorLookup
};
```

**After:**

```tsx
export const MyComponent = () => {
  const Config = getMergedConfig();
  const errorLookup = { NOT_FOUND: Config.task.errorText };
  // ...
};
```

> **Common mistake:** moving `getMergedConfig()` inside the component body but keeping a module-level `export const lookup = { key: getMergedConfig().section }` — the exported object still evaluates at module load time.

**Variant -- getter function for exported objects:**

When module-level objects are exported and consumed by other modules, convert them to getter functions:

```tsx
// Before
export const statusObj = { ACTIVE: { text: Config.completedText } };

// After
export const getStatusObj = () => {
  const Config = getMergedConfig();
  return { ACTIVE: { text: Config.completedText } };
};
```

**Files:** Many files including `XrayStatus.tsx`, `CrtkStatus.tsx`, `ChecklistTag`, `TaskProgressTagLookup`, `NaicsCodeInput`, `getCost`, `BusinessDateValidators`, `getNextSeoTitle.ts`, `helpers.ts`, `onboardingPageHelpers.ts`, `getEmployerAccessQuarterlyDropdownOptions.ts`, and various test files.

**Also in `setupTests.js`:** The global `useConfig` mock was restructured to call `getMergedConfig()` lazily inside the function body:

```js
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

### Practice 14: Nested component extraction

**What changed:** Components defined inside another component's render body get a new function identity on every render. React treats them as different component types, unmounting and remounting them each time. Under React 18 this was wasteful but often invisible. Under React 19's stricter concurrent checks, it can cause "Cannot update a component while rendering a different component" errors and visible flicker.

**Before:**

```tsx
const ParentPage = () => {
  const Header = (props) => <h1>{props.title}</h1>; // Re-created every render!
  return <Header title="Hello" />;
};
```

**After:**

```tsx
const Header = (props: { title: string }) => <h1>{props.title}</h1>; // Stable identity

const ParentPage = () => {
  return <Header title="Hello" />;
};
```

**Real example -- `web/src/components/data-fields/tax-id/DisabledTaxId.tsx`:**

```tsx
// Extracted to module scope
const SimpleDiv = (props: { children: ReactNode }): ReactElement => (
  <div className="flex">
    <div>{props.children}</div>
  </div>
);

export const DisabledTaxId = (props: Props): ReactElement => {
  const Element = useMemo(() => props.template ?? SimpleDiv, [props.template]);
  // ...
};
```

**Files:** `njeda.tsx` (FundingsHeader), `DisabledTaxId.tsx` (SimpleDiv), `PersonalizeYourTasksTab.tsx` (AccordionHeader), `CrtkSearchResult.tsx` (CrtkContactInfo)

---

### Practice 15: React 19 children normalization

**What changed:** React 19 may not wrap a single child in an array. In React 18, `props.children` for a component with one child was sometimes an array of length 1, sometimes a bare value. React 19 is more consistent about passing a bare value for single children, but this means code that unconditionally calls `Array.isArray(props.children)` can get different results.

**Before:**

```tsx
if (Array.isArray(props.children) && props.children[0].startsWith("[]")) {
  // ...
}
```

**After -- `web/src/components/Content.tsx` (ListOrCheckbox):**

```tsx
const ListOrCheckbox = (props: any): ReactElement => {
  // React 19 compatibility: normalize children to array
  const childrenArray = Array.isArray(props.children) ? props.children : [props.children];
  const firstChild = childrenArray[0];

  if (firstChild && typeof firstChild === "string" && firstChild.startsWith("[]")) {
    const checklistItemId = firstChild.slice("[]".length).split("{")[1].split("}")[0];
    const checklistItemBody = [firstChild.split("}")[1], ...childrenArray.slice(1)];

    return (
      <div>
        <FormControlLabel
          label={checklistItemBody}
          control={<TaskCheckbox checklistItemId={checklistItemId} />}
        />
      </div>
    );
  }
  return <li>{props.children ?? ""}</li>;
};
```

**After -- `web/src/components/ContextualInfoLink.tsx`:**

```tsx
export const ContextualInfoLink = (props: any): ReactElement => {
  // React 19 compatibility: children might be a string or an array
  const childrenText = Array.isArray(props.children) ? props.children[0] : props.children;
  const displayText = childrenText.split("|")[0];
  const contextualInfoId = childrenText.split("|")[1];

  return <ContextualInfoButton text={displayText} id={contextualInfoId} />;
};
```

**Also in `Content.tsx` (Link):**

```tsx
const childrenContent =
  props.children && Array.isArray(props.children) ? props.children[0] : props.children;
```

**Rule:** Never assume `props.children` is an array. Always normalize first.

---

### Practice 16: Navbar pure function extraction

**What changed:** Components that used hooks internally but were called as plain functions (not rendered as JSX) violated React's rules of hooks when called conditionally. React 19 enforces this more strictly.

**Solution:** Extract the hook-dependent logic into a pure function that receives hook values as arguments. Call hooks in the parent component and pass the results down.

**Before:** `<ProfileMenuItem />` was a component with internal `useConfig()`, `useUserData()`, etc.

**After -- `web/src/components/navbar/shared-submenu-components.tsx`:**

```tsx
// Pure function version that doesn't use hooks - safe for conditional calls
export const createProfileMenuItems = (
  userData: UserData | undefined,
  handleClose: () => void,
  isAuthenticated: boolean,
  Config: ReturnType<typeof useConfig>["Config"],
  setShowRemoveBusinessModal: (value: boolean) => void,
  updateQueue: ReturnType<typeof useUserData>["updateQueue"],
  router: ReturnType<typeof useRouter>,
  isProfileSelected: boolean,
): ReactElement[] => {
  if (!userData) return [];
  // ... pure logic using only the arguments
};

// Wrapper that calls hooks - must be used in component context
export const ProfileMenuItem = (props: {
  handleClose: () => void;
  isAuthenticated: boolean;
  userData?: UserData;
}): ReactElement[] => {
  const { Config } = useConfig();
  const { setShowRemoveBusinessModal } = useContext(RemoveBusinessContext);
  const { updateQueue } = useUserData();
  const router = useRouter();
  const isProfileSelected = router?.route === ROUTES.profile;

  return createProfileMenuItems(
    props.userData,
    props.handleClose,
    props.isAuthenticated,
    Config,
    setShowRemoveBusinessModal,
    updateQueue,
    router,
    isProfileSelected,
  );
};
```

The same pattern is applied to `createAddBusinessItems`:

```tsx
export const createAddBusinessItems = (
  handleClose: () => void,
  Config: ReturnType<typeof useConfig>["Config"],
  router: ReturnType<typeof useRouter>,
): ReactElement[] => { ... };

export const AddBusinessItem = (props: { handleClose: () => void }): ReactElement[] => {
  const { Config } = useConfig();
  const router = useRouter();
  return createAddBusinessItems(props.handleClose, Config, router);
};
```

**Files:** `web/src/components/navbar/shared-submenu-components.tsx`, `NavBarDesktop.tsx`, `NavBarMobile.tsx`

---

### Practice 17: Stable ID generation

**What changed:** Generating a new random ID on every render (e.g., `id={Math.random().toString().slice(2)}`) causes React to see a different prop each render, triggering unnecessary DOM mutations. Under React 19's concurrent mode, this can also cause hydration mismatches.

**Before:**

```tsx
<ClampLines id={Math.random().toString().slice(2)} ... />
```

**After -- `web/src/components/ExpandCollapseString.tsx`:**

```tsx
import { ReactElement, useState } from "react";
import ClampLines from "react-clamp-lines";

export const ExpandCollapseString = (props: Props): ReactElement => {
  const [id] = useState(() => Math.random().toString().slice(2));

  return (
    <div {...(props.dataTestId ? { "data-testid": props.dataTestId } : {})}>
      <ClampLines
        text={props.text}
        id={id}
        lines={props.lines}
        ellipsis="..."
        moreText={props.viewMoreText}
        lessText={props.viewLessText}
        className="lines-ellipsis"
        innerElement="p"
      />
    </div>
  );
};
```

**Why `useState` instead of `useRef`:** `useState` with an initializer function produces a stable value for the component’s lifetime. (In dev/StrictMode and under retries, initializer functions may be invoked more than once, so keep them pure.) `useRef` would also work, but `useState` makes the intent clearer: this is a value, not a mutable container.

---

### Practice 18: useEffect-to-useState initializer

**What changed:** A common React pattern is to initialize state with a default and then immediately sync it from props via `useEffect`:

```tsx
const [data, setData] = useState(createEmpty());
useEffect(() => {
  if (business) setData(business.data);
}, [business]);
```

Under React 19, this causes a double-render (initial with empty, then effect fires and updates). The effect-based sync can also trigger "Cannot update while rendering" warnings.

**After:**

```tsx
const [data, setData] = useState(business?.data ?? createEmpty());
// Parent uses key= prop to remount when business changes
```

> **Common mistake:** removing the `useEffect` sync without adding a `key` prop on the parent — the component keeps its stale initial state the next time the source data (e.g., `business`) changes.

The parent component uses `key={resetCounter}` or `key={businessId}` to force a fresh mount with new initial state when the source data changes. This is more correct than an effect sync because it guarantees the component starts with the right data.

**Files:** `LicenseTask.tsx`, `FormationDateModal.tsx`

---

### Practice 19: Shared static loaders (unified/YAML) -- keep parsing code library-safe

**What changed:** This PR updates shared “static content” utilities that parse YAML/Markdown used across the repo. The changes are not React-specific, but they matter because React 19 forced a broader dependency upgrade (unified + related ecosystem), and these shared loaders are easy to accidentally break during a large version bump.

**Patterns to follow:**

- Keep parsing functions pure and side-effect free (easy to test, safe to run in build steps).
- Prefer explicit error messages when YAML/Markdown inputs are invalid (contributors need fast feedback).
- Keep file IO boundaries narrow (`loadYamlFiles` reads; other helpers parse/validate).

**Files:** `shared/src/static/loadYamlFiles.ts`, `shared/src/static/loadAnytimeActionTasks.ts`, `shared/src/static/loadAnytimeActionLicenseReinstatements.ts`, `shared/src/utils/tasksMarkdownReader.ts`

---

### Practice 20: API React Email templates -- keep dependencies aligned, keep components simple

**What changed:** The API workspace updates its React Email dependencies and templates in the same upgrade commit. This reduces “split brain” where the repo is on React 19 in one workspace and an older React ecosystem in another.

**Patterns to follow:**

- Keep email components simple and deterministic (no runtime-only APIs).
- Avoid introducing browser-only dependencies into email template code.

**Files:** `api/src/functions/messagingService/reactEmail/package.json`, `api/src/functions/messagingService/reactEmail/components/Header.tsx`, `api/src/functions/messagingService/reactEmail/emails/welcomeEmailShortVersion.tsx`

---

### Practice 21: Workspace-aware Docker builds -- separate build deps from runtime deps

**What changed:** The Docker build uses Yarn workspaces focus to (a) install build-time dependencies in the builder stage and (b) install production-only dependencies for runtime. Combined with Next standalone output, this reduces runtime size and aligns with how the app is actually started (`node server.js`).

**Files:** `WebApp.Dockerfile`, `.github/actions/package-webapp-docker/action.yml`, `web/next.config.ts`

---

## FAQ

**Q: Why are there so many `setTimeout(0)` calls?**

A: React 19's automatic batching and concurrency make timing issues easier to trip over, especially when effects “sync” derived state. `setTimeout(0)` defers the update to the next event-loop task, outside the current render/effect turn. This is a workaround, not a permanent solution. Each usage should be reviewed to determine if a structural fix (eliminating derived state, moving to event handlers, extracting nested components) would be better.

**Q: Why does `userEvent.type()` break with numeric inputs?**

A: Known upstream bug ([testing-library/user-event#1286](https://github.com/testing-library/user-event/issues/1286)). React 19 + MUI controlled numeric inputs cause infinite loops with `userEvent.type()` because the input's value normalization triggers a re-render loop. Use `fireEvent.change()` as a workaround until the upstream fix ships.

**Q: Why is `enableAccessibleFieldDOMStructure={false}` used on all date pickers?**

A: MUI v7's new accessible DOM structure splits a date field into multiple `<input>` elements (one per segment: month, day, year). Our custom `GenericTextField` slot component assumes a single input. Setting it to `false` preserves the legacy single-input structure. Plan to migrate to `true` once custom slots are updated to handle the multi-input DOM.

**Q: Why were fake timers replaced with real timers in tests?**

A: React 19's `findBy*` queries use internal `setTimeout`-based polling. With `jest.useFakeTimers()` active, these polls never fire, causing `findBy*` to hang indefinitely. If your test needs fake timers for other reasons, you must manually advance them or switch to real timers before any `findBy*` call.

**Q: Do I need to worry about `forwardRef` removal?**

A: On this branch, prefer ref-as-prop (Practice 1). Existing `forwardRef` wrappers still work in React 19. New code should use ref-as-prop to match the branch standard and reduce wrapper boilerplate. The ESLint `react-hooks` plugin needs a temporary `/* eslint-disable react-hooks/refs */` comment. Track the plugin update.

**Q: Why was `react-transition-group` replaced instead of upgraded?**

A: `react-transition-group` depends on `findDOMNode`, which React 19 removes. There is no React 19-compatible release. Rather than forking the library, we wrote a small internal `CSSTransition` replacement (Practice 8) that covers our exact usage pattern.

**Q: Why is `jest.setTimeout(30000)` set globally?**

A: React 19's async rendering and the `MessageChannel` polyfill add overhead to every test. Combined with parallel test execution and CPU contention in CI, the default 5-second timeout was causing intermittent failures. A higher global timeout provides margin without forcing every test to set its own timeout.

---

## Anti-Patterns (from PR review feedback)

1. **Don't add "React 19:" comments that restate code.** Comments should explain _why_ a change was necessary, not _what_ the code does. Bad: `// React 19: use setTimeout`. Good: `// React 19: defer state update to avoid "Cannot update while rendering" warning when parent re-renders synchronously`.

2. **Don't use `setTimeout` without a documented failure mode.** Every `setTimeout(0)` should have a comment explaining what breaks without it. If you cannot describe the failure, the `setTimeout` may not be necessary.

3. **Don't mix `fireEvent` and `userEvent` in the same test without a comment explaining why.** Reviewers will assume this is an oversight. Document the upstream bug (user-event#1286) or other reason.

4. **Don't hardcode CMS strings when extracting nested components.** Pass `Config` as a prop instead. This preserves CMS editability and testability.

5. **Don't accept `ref` in props without forwarding it to a DOM element.** This silently drops the ref. Either forward it or remove it from the interface.

6. **Don't use arbitrary timeout values in `waitFor`.** Establish team conventions (e.g., rely on the global Jest timeout, or use a shared constant) rather than sprinkling `{ timeout: 10000 }` in individual tests.

7. **Don't define components inside render.** Always hoist component definitions to module scope. See Practice 14.

---

## Developer Checklist

### Before writing new code on `main`:

- [ ] No new `forwardRef` (use ref-as-prop pattern)
- [ ] Tests use `userEvent` + `findByRole` (except numeric inputs -- use `fireEvent.change`)
- [ ] No `setTimeout(0)` without a justification comment
- [ ] Config reads guarded with `?.` and `?? ""`
- [ ] No nested component definitions in render bodies
- [ ] `ReactNode` for return types (not `JSX.Element`)
- [ ] `RefObject<T | null>` for ref types
- [ ] No module-level `getMergedConfig()` calls

### Before merging the react-19 branch:

- [ ] All `setTimeout(0)` usages reviewed -- can any be structural fixes?
- [ ] All skipped Cypress tests have tracking tickets
- [ ] Dead code removed (`form-helpers.ts`, `test-unused-content-access.spec.ts`, 8 unused accessible-query helpers)
- [ ] Comment hygiene pass (remove redundant "React 19:" comments that restate code)
- [ ] CrtkSearchResult CMS string un-hardcoded
- [ ] NavMenuItem hover functionality verified or intentionally removed
- [ ] PrimaryButton ref forwarding verified (implicit via `{...props}` spread -- make explicit or document)
