import { Industry } from "@/lib/types/types";
import orderBy from "lodash.orderby";

type IndustryOption = {
  primaryText: string;
  secondaryText: string;
};

export const IndustryLookup: Record<Industry, IndustryOption> = {
  restaurant: {
    primaryText: "Restaurant",
    secondaryText: "Providing food to patrons",
  },
  "home-contractor": {
    primaryText: "Home Improvement Contractor",
    secondaryText: "Repairing or renovating residential or non-commercial properties",
  },
  "e-commerce": {
    primaryText: "E-Commerce",
    secondaryText: "Selling or reselling goods or services on the internet",
  },
  "cleaning-aid": {
    primaryText: "Cleaning Aid",
    secondaryText: "Offering services and aid related to cleaning",
  },
  "retail": {
    primaryText: "Retail",
    secondaryText: "Selling or reselling goods",
  },
  cosmetology: {
    primaryText: "Cosmetology",
    secondaryText: "Offering hair, nail, or skin related services",
  },
  generic: {
    primaryText: "Any Other Business Type",
    secondaryText: "Select this if you don’t see your specific industry",
  },
};

export const ALL_INDUSTRIES_ORDERED: Industry[] = orderBy([
  "cosmetology",
  "home-contractor",
  "e-commerce",
  "restaurant",
  "cleaning-aid",
  "retail",
  "generic",
], (industry) => {return industry});
