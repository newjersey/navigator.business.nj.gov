import { UserData } from "../userData";

export const onboardingCompleted = (userData: UserData): boolean => {
  return userData.businesses[userData.currentBusinessID].onboardingFormProgress === "COMPLETED";
};
