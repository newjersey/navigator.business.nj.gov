# Align Zod Schema with TypeScript Interfaces

You are an iterative agent that aligns the Zod schema in `api/src/db/zodSchema/zodSchemas.ts` with the TypeScript interfaces defined in the migration file. The goal is to make the output of `print:user-schema:ts-zod` (Zod-derived) **effectively equivalent** to `print:user-schema:ts` (TS Compiler API-derived).

## "Effectively equivalent" — not identical

The Zod schema is a **validation layer** and is allowed to be **more precise** than the TypeScript types. A diff line is acceptable if the Zod type is a strict subtype of the TS type. Examples:

| TS type                | Zod type                               | Acceptable? | Why                                                    |
| ---------------------- | -------------------------------------- | ----------- | ------------------------------------------------------ |
| `number`               | `1 \| 2 \| 3 \| 4 \| 5`                | Yes         | Literal union is a subtype of `number`                 |
| `string`               | `"ACTIVE" \| "EXPIRED"`                | Yes         | String literal union is a subtype of `string`          |
| `string`               | `string` (with `.max()` or `.regex()`) | Yes         | Constrained string is still `string` at the type level |
| `boolean`              | `true`                                 | Yes         | `true` is a subtype of `boolean`                       |
| `string \| undefined`  | `string`                               | **No**      | Missing `undefined` narrows the type                   |
| `{ "foo"?: string }`   | `{ "foo": string }`                    | **No**      | Required vs optional is a structural mismatch          |
| `readonly "x": string` | `"x": string`                          | **No**      | Missing `readonly` is a structural mismatch            |

**Rule of thumb**: if every valid value under the Zod type is also valid under the TS type, the difference is fine. If the Zod type accepts values the TS type rejects (or vice versa for structural features like optionality/readonly), it needs fixing.

## Ground Rules

- The TypeScript interfaces in the migration file are the **source of truth**. Do NOT modify the migration file.
- Only modify `api/src/db/zodSchema/zodSchemas.ts` to bring the Zod schema in line with the TS interfaces.
- Do NOT change `api/scripts/printUserZodSchema.ts`, `api/scripts/diffUserSchemas.sh`, or any other files.
- Do NOT change the serialization logic — the output format is correct; the Zod schema data is what needs fixing.
- Preserve all existing validation behavior (checks, refinements). Only fix structural mismatches.

## Workflow

Repeat the following loop until you judge the remaining diff lines are all acceptable precision differences, or you've reached 10 iterations:

### Step 1: Run the diff

```bash
yarn workspace @businessnjgovnavigator/api print:user-schema:diff
```

If the output says "Schemas are identical", you're done — report success and stop.

### Step 2: Analyze the diff

Read the unified diff output. For each difference, classify it as:

- **Acceptable precision** (Zod is more specific, skip it):
  - Literal unions where TS has a broader primitive (`number`, `string`, `boolean`)
  - Additional constraints that don't change the type shape

- **Needs fixing** (structural mismatch):
  - **Missing `readonly`**: TS has `readonly` but Zod doesn't
  - **Optionality mismatch**: Field is `?:` in TS but required in Zod, or vice versa
  - **Type mismatch**: Field has a fundamentally different type (not just more precise)
  - **Missing/extra fields**: Field exists in one but not the other
  - **Wrong union members**: Zod has values that aren't subtypes of the TS type

### Step 3: Fix the Zod schema

Read `api/src/db/zodSchema/zodSchemas.ts` and make targeted edits to fix only the "needs fixing" mismatches. Common fixes:

- Add `.optional()` for missing optionality
- Add `.readonly()` for missing readonly modifiers
- Add or remove fields to match the interface
- Adjust union members when they aren't subtypes

Make the minimum changes needed — do not refactor unrelated code.

### Step 4: Verify and loop

Run the diff again. If unacceptable differences remain, go back to step 2. If only acceptable precision differences remain, report success.

## Reporting

After each iteration, briefly report:

- Iteration number
- Number of diff lines remaining
- What you fixed vs. what you skipped (and why)

When finished, summarize:

- All changes made to `zodSchemas.ts`
- Remaining diff lines and why each is acceptable
