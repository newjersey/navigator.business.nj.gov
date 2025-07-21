# Form Validation Setup Guide

Here's a brief summary on setting up form validations in your React application:

## Step 1: Set up DataFormErrorMapContext in Parent Component

In your parent component that manages the form, you need to:

### 1. Import the required dependencies:

```typescript
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
```

### 2. Use `useFormContextHelper` to create the error map and helper functions:

```typescript
const {
  FormFuncWrapper,
  getInvalidFieldIds,
  onSubmit,
  state: formContextState,
} = useFormContextHelper(createDataFormErrorMap());
```

### 3. Wrap your form components with the context provider:

```typescript
<DataFormErrorMapContext.Provider value={formContextState}>
  {/* Your form components go here */}
</DataFormErrorMapContext.Provider>
```

## Key Helper Functions Explained

### `onSubmit`

- **Purpose:** Handles form submission events
- **Usage:** Pass this function to your form's `onSubmit` prop
- **Behavior:** Prevents default form submission, triggers validation across all registered fields

### `getInvalidFieldIds`

- **Purpose:** Returns an array of field IDs that are currently invalid
- **Usage:** Use to determine if validation errors exist: `getInvalidFieldIds().length > 0`
- **Common Pattern:** Show page-level alerts when validation errors are present

### `FormFuncWrapper`

- **Purpose:** Wraps your actual submit logic and handles validation timing
- **Usage:** Call this function with your submit logic as a callback
- **Behavior:**
  - Ensures all validations are complete before executing your submit function
  - Only runs your submit logic if the form is valid
  - Handles the coordination between validation state and submission

## Typical Implementation Pattern

```typescript
export const YourFormComponent = (props: Props) => {
  const {
    FormFuncWrapper,
    getInvalidFieldIds,
    onSubmit,
    state: formContextState,
  } = useFormContextHelper(createDataFormErrorMap());

  // Show alert if there are validation errors
  const showAlert = getInvalidFieldIds().length > 0;

  return (
    <DataFormErrorMapContext.Provider value={formContextState}>
      {showAlert && (
        <Alert variant="error">
          Please correct the errors below.
        </Alert>
      )}

      <YourFormFields
        onSubmit={onSubmit}
        formFuncWrapper={FormFuncWrapper}
      />
    </DataFormErrorMapContext.Provider>
  );
};
```

## Summary

This setup provides a centralized validation system where:

- Individual form fields can register themselves for validation
- The parent component coordinates the overall form state and submission process
- Validation errors are tracked and displayed consistently across the form
- Form submission is prevented until all validations pass
