import { Business, UserData } from "@businessnjgovnavigator/shared/userData";

export const getBusinessById = ({
  userData,
  previousBusinessId,
}: {
  userData: UserData;
  previousBusinessId: string;
}): Business => {
  return userData.businesses[previousBusinessId];
};
