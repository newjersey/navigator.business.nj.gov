import { Industry } from "@/lib/types/types";

export const isLiquorLicenseApplicable = (industry: Industry | undefined): boolean => {
  return industry === "restaurant";
};
