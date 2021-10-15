import { Industry } from "@/lib/types/types";

export const isHomeBasedBusinessApplicable = (industry: Industry | undefined): boolean => {
  return (
    industry === "generic" ||
    industry === "home-contractor" ||
    industry === "e-commerce" ||
    industry === "retail" ||
    industry === "cleaning-aid" ||
    industry === "employment-agency"
  );
};
