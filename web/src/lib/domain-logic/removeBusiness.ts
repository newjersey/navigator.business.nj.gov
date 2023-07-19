import { UserData } from "@businessnjgovnavigator/shared/userData";

// eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-function-return-type
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
    throw "Business does not exist";
  }

  return {
    ...userData,
    currentBusinessId: newCurrentBusinessId,
    businesses: removeKey(idToRemove, userData.businesses),
  };
};
