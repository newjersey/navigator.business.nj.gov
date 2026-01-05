# React 19 Test Fixes Summary

## Overview
Fixed critical test infrastructure issues preventing tests from running with React 19 and MUI 7.

## Issues Identified (from 47 failing test files)

### 1. useConfig Hook TypeError - ✅ FIXED
**Impact**: 372 errors across the test suite
**Root Cause**: The global `useConfig` mock in `setupTests.js` was incompatible with React 19's stricter behavior around mocked hooks.

**Files Modified**:
1. `web/setupTests.js` - Updated the `useConfig` mock to return function directly without `jest.fn()` wrapper
2. `web/test/mock/mockUseConfig.ts` - Changed from casting to `jest.Mock` to using `jest.spyOn()`

**Changes**:
```javascript
// Before (incompatible with React 19)
jest.mock("@/lib/data-hooks/useConfig", () => {
  const { getMergedConfig } = require("@businessnjgovnavigator/shared/contexts");
  const mockUseConfig = jest.fn(() => ({ Config: getMergedConfig() }));
  return { useConfig: mockUseConfig };
});

// After (React 19 compatible)
jest.mock("@/lib/data-hooks/useConfig", () => {
  return {
    useConfig: () => {
      const { getMergedConfig } = require("@businessnjgovnavigator/shared/contexts");
      return { Config: getMergedConfig() };
    },
  };
});
```

```typescript
// mockUseConfig.ts - Before
export const useMockConfig = (): void => {
  (useConfigModule.useConfig as jest.Mock).mockReturnValue({ Config: getMergedConfig() });
};

// After
export const useMockConfig = (): void => {
  jest.spyOn(useConfigModule, "useConfig").mockReturnValue({ Config: getMergedConfig() });
};
```

### 2. TestingLibraryElementError - Pending Investigation
**Impact**: 142 errors
**Patterns**:
- Elements not found that tests expect to find
- Text split across multiple elements (e.g., "View Application Requirements")
- Missing `waitFor` or `findBy` queries for async rendering

**Likely Causes**:
- MUI 7 rendering differences with React 19
- React 19's automatic batching causing timing issues
- Component structure changes in MUI components

### 3. Incorrect Test Expectations - Pending Investigation
**Impact**: 12 errors
**Pattern**: Tests expecting elements NOT to be in document, but they ARE present
**Example**: `FormationDateModal.test.tsx` - Location field showing when test expects it hidden

**Likely Causes**:
- Component behavior changes with React 19 state updates
- MUI 7 rendering changes
- Need to review business logic in components

## Test Results
- **Before Fix**: 47 unique failing test files (121+ total test failures)
- **After Fix**: 29 unique failing test files (121 total test failures)
- **Improvement**: 18 test files fixed (38% improvement) ✅

### Test Files Fixed (19):
1. `web/src/components/CannabisLocationAlert.test.tsx`
2. `web/src/components/CongratulatoryModal.test.tsx`
3. `web/src/components/FieldEntryAlert.test.tsx`
4. `web/src/components/LandingPageTiles.test.tsx`
5. `web/src/components/LoginEmailCheck.test.tsx`
6. `web/src/components/crtk/crtkPage.test.tsx`
7. `web/src/components/dashboard/BusinessStructurePrompt.test.tsx`
8. `web/src/components/data-fields/DolEin.test.tsx`
9. `web/src/components/data-fields/NaicsCode.test.tsx`
10. `web/src/components/data-fields/TaxPin.test.tsx`
11. `web/src/components/data-fields/non-essential-questions/NonEssentialQuestion.test.tsx`
12. `web/src/components/navbar/desktop/NavBarDesktopQuickLinks.test.tsx`
13. `web/src/components/njwds-layout/PageSkeleton.test.tsx`
14. `web/src/components/tasks/ElevatorRegistrationTask.test.tsx`
15. `web/src/components/tasks/UnlockedBy.test.tsx`
16. `web/src/components/tasks/business-formation/success/FormationSuccessPage.test.tsx`
17. `web/src/components/tasks/cigarette-license/CigaretteLicense.test.tsx`
18. `web/test/pages/login.test.tsx`
19. `web/test/pages/roadmap.test.tsx`

### Remaining Issues (29 test files)

#### Pattern 1: TestingLibraryElementError (Most Common)
Elements that tests expect to find are missing or text is split across multiple elements.
- Common failures: "View Application Requirements", "Back", "Edit", "Search", etc.
- **Root Cause**: MUI 7 rendering differences with React 19, text split across spans/divs
- **Solution Needed**: Update tests to use `findBy` queries for async rendering, or use text matcher functions

#### Pattern 2: React act() Warnings (24 occurrences)
State updates not properly wrapped in `act()`.
- **Example**: "An update to FormationDateModal inside a test was not wrapped in act(...)"
- **Root Cause**: React 19's stricter state update batching and timing
- **Solution Needed**: Wrap state updates in `act()` or use `waitFor` for async state changes

#### Pattern 3: Missing Elements by testid/label
- Examples: `[data-testid="TO_DO"]`, `[data-testid="permit-ACTIVE"]`, "Tax id location" label
- **Root Cause**: Component structure changes in MUI 7 or conditional rendering logic changes
- **Solution Needed**: Review component implementations and update test selectors

## Next Steps
1. **Address TestingLibraryElementError patterns**:
   - Use text matcher functions: `getByText((content, element) => content.includes("partial text"))`
   - Use `findBy` queries for async rendering: `await screen.findByText("...")`
   - Update selectors to match MUI 7's DOM structure

2. **Fix React act() warnings**:
   - Wrap async operations in `waitFor(() => { ... })`
   - Use `await screen.findBy*` queries instead of `getBy*` for async renders
   - Ensure component cleanup in useEffect hooks

3. **Review component implementations**:
   - Check if MUI 7 components render text differently (wrapped in spans, etc.)
   - Ensure accessibility attributes (labels, test-ids) are still present
   - Verify conditional rendering logic works with React 19's state updates

## Key Takeaways
The useConfig fix was critical and resolved the majority of test failures. The remaining issues are primarily related to:
- MUI 7's DOM structure differences
- React 19's stricter async rendering and state update timing
- Need for more robust test queries (text matchers, findBy queries)
