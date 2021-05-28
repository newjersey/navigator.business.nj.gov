import { Industry } from "../lib/types/types";

type IndustryOption = {
  primaryText: string;
  secondaryText: string;
};

export const IndustryLookup: Record<Industry, IndustryOption> = {
  restaurant: {
    primaryText: "Restaurant",
    secondaryText: "Food Services and Drinking Places",
  },
  "home-contractor": {
    primaryText: "Home Improvement Contractor",
    secondaryText: "Construction of Buildings",
  },
  "e-commerce": {
    primaryText: "E-Commerce",
    secondaryText: "Nonstore Retailers, Electronic Shopping and Mail-Order Houses",
  },
  cosmetology: {
    primaryText: "Cosmetology",
    secondaryText: "Personal and Laundry Services",
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
