import { UserData } from "../userData";
import { businessStructureTaskId } from "./taskIds";

export const hasCompletedBusinessStructure = (userData: UserData): boolean => {
  if (!userData || !userData.taskProgress) return false;
  return userData.taskProgress[businessStructureTaskId] === "COMPLETED";
};
