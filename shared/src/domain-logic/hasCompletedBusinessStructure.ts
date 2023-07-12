import { businessStructureTaskId } from "./taskIds";
import {Business} from "../userData";

export const hasCompletedBusinessStructure = (business: Business | undefined): boolean => {
  if (!business || !business.taskProgress) return false;
  return business.taskProgress[businessStructureTaskId] === "COMPLETED";
};
