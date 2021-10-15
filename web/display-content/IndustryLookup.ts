import { Industry, ALL_INDUSTRIES } from "@/lib/types/types";
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
  "employment-agency": {
    primaryText: "Employment Agency",
    secondaryText:
      "A business contracted to hire and staff employees for other companies.",
  },
  "food-truck": {
    primaryText: "Food Truck",
    secondaryText:
      "A vehicle where food or beverages are transported, stored or prepared for sale at temporary locations.",
  },
  retail: {
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

export const ALL_INDUSTRIES_ORDERED: Industry[] = orderBy(ALL_INDUSTRIES, (industry) => {
  return industry;
});
