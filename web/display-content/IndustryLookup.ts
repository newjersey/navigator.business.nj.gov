import { Industry } from "../lib/types/types";

export const IndustryLookup: Record<Industry, string> = {
  restaurant: "Restaurant",
  "home-contractor": "Home-Improvement Contractor",
  "e-commerce": "E-Commerce",
  cosmetology: "Cosmetology",
  generic: "",
};

export const ALL_INDUSTRIES_ORDERED: Industry[] = [
  "restaurant",
  "e-commerce",
  "home-contractor",
  "cosmetology",
  "generic",
];
