import { Industry } from "@/lib/types/types";

export const convertIndustryToLicenseType = (industry: Industry): string => {
  if (industry === "home-contractor") {
    return "Home Improvement Contractors";
  }
  if (industry === "cosmetology") {
    return "Cosmetology and Hairstyling";
  }

  throw `${industry} does not have a license type`;
};
