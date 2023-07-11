import { Business } from "./business";
import { UserDataPrime } from "./userData";

export const getUserDataWithUpdatedCurrentBusiness = (
  userData: UserDataPrime,
  updatedBusiness: Business
): UserDataPrime => {
  const updatedBusinesses = { ...userData.businesses, [userData.currentBusinessID]: updatedBusiness };
  return { ...userData, businesses: updatedBusinesses };
};
export const getCurrentBusinessForUser = (userData: UserDataPrime): Business => {
  return userData.businesses[userData.currentBusinessID];
};
