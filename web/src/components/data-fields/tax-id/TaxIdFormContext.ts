import { createFormContext } from "@/contexts/formContext";
import { createReducedFieldStates } from "@/lib/types/types";

export const taxIdFormContextErrorMap = createReducedFieldStates(["taxId", "taxIdLocation"]);
type ErrorMapType = typeof taxIdFormContextErrorMap;
export const taxIdFormContext = createFormContext<ErrorMapType>();
