import { FormationFields } from "@businessnjgovnavigator/shared/formationData";
import { invert } from "lodash";

const fieldToApiFieldMapping: Record<string, string> = {
  agentNumber: "Registered Agent - Id",
};

const apiFieldToFieldMapping = invert(fieldToApiFieldMapping);

export const getApiField = (field: FormationFields): string => {
  return fieldToApiFieldMapping[field] || "";
};

export const getFieldByApiField = (apiField: string): string => {
  return apiFieldToFieldMapping[apiField] || "";
};
