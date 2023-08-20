import { createEmptyBusiness, UserData } from "@businessnjgovnavigator/shared/userData";

export const addAdditionalBusiness = (userData: UserData): UserData => {
  const additionalBusiness = createEmptyBusiness();
  return {
    ...userData,
    currentBusinessId: additionalBusiness.id,
    businesses: {
      ...userData.businesses,
      [additionalBusiness.id]: additionalBusiness,
    },
  };
};
