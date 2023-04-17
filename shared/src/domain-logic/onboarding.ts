import { UserData } from "../userData";

export const onboardingCompleted = (userData: UserData): boolean => {
  return userData.onboardingFormProgress === "COMPLETED";
};
