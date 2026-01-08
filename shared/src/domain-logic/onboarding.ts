import { Business } from "@businessnjgovnavigator/shared/userData";

export const onboardingCompleted = (business: Business): boolean => {
  return business.onboardingFormProgress === "COMPLETED";
};
