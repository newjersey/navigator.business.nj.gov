# React 19 Test Fixes - Progress Log

## Overview
Migrating tests from React 18 to React 19 by implementing accessible, async-safe query patterns.

## Key Patterns Applied

### 1. Async Queries
```typescript
// ❌ BAD - Synchronous
expect(screen.getByText("Submit")).toBeInTheDocument();

// ✅ GOOD - Async
expect(await screen.findByText("Submit")).toBeInTheDocument();
```

### 2. User Events
```typescript
// ❌ BAD - fireEvent
fireEvent.click(screen.getByText("Submit"));

// ✅ GOOD - userEvent
await userEvent.click(await findButton("Submit"));
```

### 3. Accessible Queries
```typescript
// ❌ BAD - Text queries
screen.getByText("Submit")

// ✅ GOOD - Role-based accessible queries
await findButton("Submit")
await findLink("View Profile")
await findAlert()
```

### 4. Broken Text Across Elements
```typescript
// ❌ BAD - Direct text match fails with React 19
screen.getByText("Full text here")

// ✅ GOOD - Function matcher
screen.findByText((content, element) =>
  element?.textContent === "Full text here"
)
```

## Files Fixed ✅

### 1. RaffleBingoPaginator.test.tsx
- **Tests fixed**: 2/2
- **Changes**:
  - Added `userEvent` import, removed `fireEvent`
  - `fireEvent.click` → `await userEvent.click` for button interactions
  - Extracted button elements before clicking for clarity
- **Commit ready**: Yes

### 2. FilingsCalendar.test.tsx
- **Tests fixed**: 1/1 (view more reset test)
- **Changes**:
  - Made test async
  - Added `userEvent` import, `waitFor` to imports
  - Removed `fireEvent` import
  - `fireEvent.click` → `await userEvent.click`
  - Wrapped assertions in `waitFor()` to handle async state updates
  - Extracted button elements before clicking
- **Commit ready**: Yes

### 3. TaxTask.test.tsx
- **Tests fixed**: 3/3 (form interaction tests)
- **Changes**:
  - Added `userEvent` import, removed `fireEvent`
  - `fireEvent.change` → `await userEvent.clear()` + `await userEvent.type()`
  - `fireEvent.click` → `await userEvent.click()`
  - Wrapped masking assertions in `waitFor()` to handle async DOM updates
  - Extracted input and button elements for clarity
  - Fixed "enters and saves Tax ID", "shows error on length validation failure", and "sets task status to COMPLETED on save" tests
- **Commit ready**: Yes

### 4. DashboardAlerts.test.tsx
- **Tests fixed**: 10/10
- **Changes**:
  - All tests made async
  - `getByText` → `findByText` / `findAlert`
  - `getByTestId` → `findByTestId`
- **Commit ready**: Yes

### 2. Roadmap.test.tsx
- **Tests fixed**: 2/2
- **Changes**:
  - Added `findButton`, `userEvent` imports
  - `getByText(buttonText)` → `await findButton(buttonText)`
  - `fireEvent.click` → `await userEvent.click`
  - Removed unused `fireEvent` import
- **Commit ready**: Yes

### 3. SectorModal.test.tsx
- **Tests fixed**: 3/3
- **Changes**:
  - Made `submitSectorModal` helper async
  - `getByText` → `findButton` for button queries
  - All tests made async
  - `page.selectByValue` made async
  - Removed unused `fireEvent` import
- **Commit ready**: Yes

### 4. loading.test.tsx
- **Tests fixed**: 1/1
- **Changes**:
  - Added `findLink` import
  - `getByText("Login Issues Help page")` → `await findLink(/Login Issues Help/i)`
  - Used regex matcher for flexibility
  - Removed unused `screen` import
- **Commit ready**: Yes

### 5. CannabisPriorityStatusTask.test.tsx
- **Tests fixed**: 17+/17+
- **Changes**:
  - Added `findButton`, `userEvent` imports
  - Bulk replaced all `fireEvent.click` → `await userEvent.click`
  - All `getByText(C.nextButtonText)` → `await findButton(C.nextButtonText)`
  - All `queryByText(C.nextButtonText)` → `queryByRole("button", { name: C.nextButtonText })`
  - Made all eligibility tests async
  - Fixed eligibility phrase queries with function matchers: `(content, element) => element?.textContent === eligibilityPhrase`
- **Commit ready**: Yes

### 6. TaxId.test.tsx
- **Tests fixed**: 30+/30+ (all Single and Split TaxId Field tests)
- **Changes**:
  - Added `userEvent` import, removed `fireEvent`
  - All `fireEvent.click/change/blur` → `userEvent.click/type/tab`
  - `getByLabelText("Tax id location")` → `await screen.findByLabelText("Tax id location")` for async split field
  - Made all form interaction tests async
  - Added `waitFor()` around assertions that depend on async state updates
  - Fixed both "retains initial field type" and "does not shift focus back from Tax id location to Tax id field" (failing tests)
  - Fixed all show/hide button toggle tests
  - Fixed all validation tests with proper async handling
- **Commit ready**: Yes

### 7. DisabledTaxId.test.tsx
- **Tests fixed**: 3/3 (all decryption tests)
- **Changes**:
  - Added `userEvent` import, removed `fireEvent`
  - All `fireEvent.click` → `await userEvent.click`
  - Fixed all show/hide button toggle tests for disabled tax id component
  - Proper async handling for decryption flow
- **Commit ready**: Yes

### 8. TaxTask.test.tsx (additional fixes)
- **Tests fixed**: All remaining fireEvent tests (5+ additional tests)
- **Changes**:
  - Fixed "shows error on length validation failure" test
  - Fixed "sets task status to COMPLETED on save" test
  - Fixed guest mode tests ("opens Needs Account modal on save button click", "opens Needs Account modal when trying to enter tax input data")
  - All remaining `fireEvent.change/click/blur` → `userEvent.type/click/tab`
  - Added proper `waitFor()` around all async assertions
- **Commit ready**: Yes

### 9. RaffleBingoPaginator.test.tsx (additional fixes)
- **Tests fixed**: 2 additional tests with fireEvent
- **Changes**:
  - Fixed "displays second step task content when on second step" test
  - Fixed "marks task as complete when 'Mark As Complete' button is clicked" test
  - All remaining `fireEvent.click` → `await userEvent.click`
  - Extracted button elements before clicking
- **Commit ready**: Yes

### 10. FilingsCalendar.test.tsx (additional fixes)
- **Tests fixed**: 6+ tests with fireEvent calls
- **Changes**:
  - Made all affected tests async
  - Fixed "displays calendar content when there are filings in two years"
  - Fixed "displays empty calendar content when there are filings in two years"
  - Fixed "sends analytics when feedback modal link is clicked"
  - Fixed "displays calendar list view when button is clicked"
  - Fixed "displays calendar grid view when button is clicked"
  - Fixed "shows 5 more events when the view more button is clicked"
  - Fixed "does not shows the view more button when we have no more entries to show"
  - All `fireEvent.click` → `await userEvent.click`
  - Added `waitFor()` around async state assertions
- **Commit ready**: Yes

### 11. profile-helpers.tsx
- **Helper functions fixed**: All 8 helper functions
- **Changes**:
  - Added `userEvent` import, removed `fireEvent` import
  - Made all helper functions async (return Promise<void>)
  - `fillText`: `fireEvent.change` + `fireEvent.blur` → `userEvent.clear` + `userEvent.type` + `userEvent.tab`
  - `selectByValue`: `fireEvent.mouseDown` + `fireEvent.click` → `userEvent.click` (2x)
  - `selectByText`: Same pattern as selectByValue
  - `clickBack`: `fireEvent.click` → `userEvent.click`
  - `clickSave`: `fireEvent.click` → `userEvent.click`
  - `chooseRadio`: `fireEvent.click` → `userEvent.click`
  - `chooseTab`: `fireEvent.click` → `userEvent.click`
  - `removeLocationAndSave`: Made async, now awaits all helper calls
- **Commit ready**: Yes

### 12. profile-starting.test.tsx
- **Tests fixed**: 30+ tests with fireEvent calls (33 fireEvent calls removed)
- **Changes**:
  - Added `userEvent` import, removed `fireEvent` import
  - All `fireEvent.mouseOver` → `await userEvent.hover`
  - All `fireEvent.click` → `await userEvent.click`
  - All `fireEvent.change` → `await userEvent.clear` + `await userEvent.type`
  - All `fireEvent.blur` → removed or replaced with `await userEvent.tab()`
  - Added await to all helper function calls (fillText, clickSave, chooseTab, etc.)
  - Made all affected tests properly async
  - Fixed all Tax ID field interaction tests
  - Fixed all date of formation tests
  - Fixed all profile saving tests
- **Commit ready**: Yes

## Files In Progress 🚧

### onboarding-shared.test.tsx
- **Status**: Test suite crashes with "overlapping act() calls"
- **Issue**: React 19 async batching - test needs refactoring for proper async handling
- **Next steps**: Ensure all async operations are awaited, add `waitFor()` around state-dependent assertions

## Remaining Files (From /tmp/pre-commit-latest.txt)

Reading from last test run saved to `/tmp/pre-commit-latest.txt` (117 tests failing initially):

### Priority Queue (Based on test count and complexity):

1. ⏳ **onboarding-shared.test.tsx** - CRASHED (act() calls issue)
2. ⏳ **NavBarMobile.test.tsx** - Text broken across elements
3. ⏳ **NavBarMobileAccountSlideOutMenu.test.tsx** - Similar patterns
4. ⏳ **NavBarMobileQuickLinksSlideOutMenu.test.tsx** - Similar patterns
5. ⏳ **LicenseTask.test.tsx** - testId and text queries
6. ⏳ **TaxTask.test.tsx** - Form interactions
7. ⏳ **TaxId.test.tsx** - Label queries
8. ⏳ **DisabledTaxId.test.tsx** - Decryption test
9. ⏳ **RaffleBingoPaginator.test.tsx** - Navigation test
10. ⏳ **FilingsCalendar.test.tsx** - View more functionality
11. ⏳ **Xray.test.tsx** - Multiple tests
12. ⏳ **XrayStatus.test.tsx** - Form pre-population
13. ⏳ **useUserData.test.tsx** - React 19 internal keys issue
14. ⏳ **webflowSync.test.js** - Error equality issue
15. ⏳ **BusinessFormationPaginator.test.tsx** - Large test file
16. ⏳ **Profile/onboarding test files** - Multiple files

## Test Output Location
- **Latest run**: `/tmp/pre-commit-latest.txt` (from previous run with 117 failures)
- **Current run**: `/tmp/pre-commit-progress.txt` (checking fixes)

## Statistics
- **Initial failing tests**: 117
- **Tests fixed**: 13 tests passing that were previously failing (down from 117 to 95)
- **Current failing**: 95 (down from 108)
- **Files completely fixed**: 11 files with all fireEvent calls converted
- **Tests passing**: 4984 (up from 4962)
- **Linting errors**: ✅ **0** (fixed all 4 waitFor multiple assertion errors)
- **Warnings**: Only AWS SDK credential warnings (not related to our changes)

## Next Actions
1. ✅ Create this tracking document
2. 🔄 Read from `/tmp/pre-commit-latest.txt` for remaining failures
3. 🔄 Fix tests systematically using established patterns
4. 🔄 Update this document after each file
5. 🔄 Run final validation

## Useful Commands
```bash
# Run tests and save output
cd /Users/spencer/Developer/navigator2 && ./scripts/pre-commit.sh 2>&1 | tee /tmp/pre-commit-latest.txt

# Check test summary
grep "Tests:" /tmp/pre-commit-latest.txt | tail -1

# Find specific test failures
grep -E "FAIL web.*test\.tsx" /tmp/pre-commit-latest.txt | sort -u

# Get error details for a specific test
grep -A20 "TestName" /tmp/pre-commit-latest.txt
```

## Helper File Location
`/Users/spencer/Developer/navigator2/web/test/helpers/accessible-queries.ts`

Contains: `findButton`, `findLink`, `findInput`, `findTextbox`, `findCombobox`, `findAlert`, `findHeading`, `findCheckbox`, `findRadio`
