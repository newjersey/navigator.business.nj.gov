import { UserData } from "../userData";

export const onboardingCompleted = (userData: UserData) => {
  return userData.formProgress === "COMPLETED";
};
