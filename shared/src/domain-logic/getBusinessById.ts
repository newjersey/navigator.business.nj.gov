import { Business, UserData } from "../userData";

export const getBusinessById = ({
  userData,
  previousBusinessId,
}: {
  userData: UserData;
  previousBusinessId: string;
}): Business => {
  return userData.businesses[previousBusinessId];
};
