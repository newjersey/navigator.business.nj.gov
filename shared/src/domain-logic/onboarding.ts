import { Business } from "../userData";

export const onboardingCompleted = (business: Business): boolean => {
  return business.onboardingFormProgress === "COMPLETED";
};
