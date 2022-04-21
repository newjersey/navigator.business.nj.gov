export const priorityTypesObj: Record<PriorityType, string[]> = {
  minorityOrWomen: ["general-minority-owned", "general-women-owned"],
  veteran: ["general-veteran-owned"],
  impactZone: [
    "cannabis-business-in-impact-zone",
    "cannabis-owner-in-impact-zone",
    "cannabis-employee-in-impact-zone",
  ],
  socialEquity: [
    "cannabis-economically-disadvantaged-social-equity",
    "cannabis-criminal-offense-social-equity",
  ],
};

export const noneOfTheAbovePriorityId = "cannabis-priority-status-none";

export type PriorityType = "minorityOrWomen" | "veteran" | "impactZone" | "socialEquity";
