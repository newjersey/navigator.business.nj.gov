import { UserData } from "@businessnjgovnavigator/shared/userData";

export const orderBusinessIdsByDateCreated = (userData: UserData): string[] => {
  return Object.keys(userData.businesses).sort((id1, id2) =>
    userData.businesses[id1].dateCreatedISO > userData.businesses[id2].dateCreatedISO ? 1 : -1
  );
};
