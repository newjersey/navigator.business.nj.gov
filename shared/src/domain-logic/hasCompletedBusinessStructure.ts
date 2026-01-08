import { Business } from "@businessnjgovnavigator/shared/userData";
import { businessStructureTaskId } from "@businessnjgovnavigator/shared/domain-logic/taskIds";

export const hasCompletedBusinessStructure = (business: Business | undefined): boolean => {
  if (!business || !business.taskProgress) return false;
  return business.taskProgress[businessStructureTaskId] === "COMPLETED";
};
