import { Industry } from "../types/types";

export const isLiquorLicenseApplicable = (industry: Industry | undefined): boolean => {
  return industry === "restaurant";
};
