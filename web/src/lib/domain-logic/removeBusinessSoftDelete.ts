import { Business, UserData } from "@businessnjgovnavigator/shared/userData";

export const removeBusinessSoftDelete = ({
  userData,
  idToSoftDelete,
  newCurrentBusinessId,
}: {
  userData: UserData;
  idToSoftDelete: string;
  newCurrentBusinessId: string;
}): UserData => {
  if (!Object.keys(userData.businesses).includes(newCurrentBusinessId)) {
    throw new Error("Business does not exist");
  }

  const businesses: Record<string, Business> = {};

  for (const business of Object.values(userData.businesses)) {
    if (business.id === idToSoftDelete) {
      businesses[business.id] = {
        ...business,
        dateDeletedISO: new Date(Date.now()).toISOString(),
      };
    } else {
      businesses[business.id] = {
        ...business,
      };
    }
  }

  return {
    ...userData,
    currentBusinessId: newCurrentBusinessId,
    businesses: businesses,
  };
};
