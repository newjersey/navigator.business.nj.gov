import { FormationFields } from "@businessnjgovnavigator/shared/formationData";
import { invert } from "lodash";

export const UNKNOWN_API_ERROR_FIELD = "UNKNOWN_API_ERROR_FIELD";

const fieldToApiFieldMapping: Record<string, string> = {
  agentNumber: "Registered Agent - Id",
};

const apiFieldToFieldMapping = invert(fieldToApiFieldMapping);

export const getApiField = (field: FormationFields): string => {
  return fieldToApiFieldMapping[field] || UNKNOWN_API_ERROR_FIELD;
};

export const getFieldByApiField = (apiField: string): string => {
  return apiFieldToFieldMapping[apiField] || UNKNOWN_API_ERROR_FIELD;
};
