import type { Business } from "../userData";
import { businessStructureTaskId } from "./taskIds";

export const hasCompletedBusinessStructure = (business: Business | undefined): boolean => {
  if (!business?.taskProgress) return false;
  return business.taskProgress[businessStructureTaskId] === "COMPLETED";
};
