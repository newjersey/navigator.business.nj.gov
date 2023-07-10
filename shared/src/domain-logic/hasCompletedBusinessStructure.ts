import { UserData } from "../userData";
import { businessStructureTaskId } from "./taskIds";

export const hasCompletedBusinessStructure = (userData: UserData | undefined): boolean => {
  if (!userData || !userData.businesses[userData.currentBusinessID].taskProgress) return false;
  return userData.businesses[userData.currentBusinessID].taskProgress[businessStructureTaskId] === "COMPLETED";
};
