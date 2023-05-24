import { UserData } from "../userData";
import { businessStructureTaskId } from "./taskIds";

export const hasCompletedBusinessStructure = (userData: UserData): boolean => {
  return userData.taskProgress[businessStructureTaskId] === "COMPLETED";
};
