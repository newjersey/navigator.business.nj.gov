import { Industry } from "../lib/types/types";

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
  cosmetology: {
    primaryText: "Cosmetology",
    secondaryText: "Offering hair, nail, or skin related services",
  },
  generic: {
    primaryText: "Some other industry",
    secondaryText: "Select this option if you don’t see anything related to your industry",
  },
};

export const ALL_INDUSTRIES_ORDERED: Industry[] = [
  "cosmetology",
  "home-contractor",
  "e-commerce",
  "restaurant",
  "generic",
];
