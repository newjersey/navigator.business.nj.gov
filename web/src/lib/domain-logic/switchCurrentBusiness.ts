import { UserData } from "@businessnjgovnavigator/shared/userData";

export const switchCurrentBusiness = (userData: UserData, newCurrentBusinessId: string): UserData => {
  if (!Object.keys(userData.businesses).includes(newCurrentBusinessId)) {
    throw new Error("Business does not exist");
  }

  return {
    ...userData,
    currentBusinessId: newCurrentBusinessId,
  };
};
