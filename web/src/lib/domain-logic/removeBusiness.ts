import type { UserData } from "@businessnjgovnavigator/shared/userData";

const removeKey = (key: string, { [key]: _, ...rest }) => rest;

export const removeBusiness = ({
  userData,
  idToRemove,
  newCurrentBusinessId,
}: {
  userData: UserData;
  idToRemove: string;
  newCurrentBusinessId: string;
}): UserData => {
  if (!Object.keys(userData.businesses).includes(newCurrentBusinessId)) {
    throw new Error("Business does not exist");
  }

  return {
    ...userData,
    currentBusinessId: newCurrentBusinessId,
    businesses: removeKey(idToRemove, userData.businesses),
  };
};
