import { createFormContext, createReducedFieldStates } from "@/contexts/formContext";

export const taxIdFormContextErrorMap = createReducedFieldStates(["taxId", "taxIdLocation"]);
type ErrorMapType = typeof taxIdFormContextErrorMap;
export const TaxIdFormContext = createFormContext<ErrorMapType>();
