import { getCurrentBusiness, type UserData } from "@businessnjgovnavigator/shared";

export const isLearnModeUser = (userData: UserData | undefined): boolean => {
  if (process.env.FEATURE_ENABLE_INTENT_SELECTION_FLOW !== "true" || !userData) {
    return false;
  }
  return (
    userData.user.onboardedAsLearningUser === true &&
    !userData.user.myNJUserKey &&
    getCurrentBusiness(userData).profileData.businessPersona === "STARTING"
  );
};
