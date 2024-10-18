import { Business, UserData } from "../userData";

export const modifyCurrentBusiness = (
  userData: UserData,
  modificationFunction: (currentBusiness: Business) => Business
): UserData => {
  return {
    ...userData,
    businesses: {
      ...userData.businesses,
      [userData.currentBusinessId]: modificationFunction(userData.businesses[userData.currentBusinessId]),
    },
  };
};
