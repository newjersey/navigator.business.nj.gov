import type { CrtkBusinessDetails } from "@businessnjgovnavigator/shared";
import type { CrtkStatusLookup, UpdateCrtk } from "@domain/types";
import { getCurrentDateISOString } from "@shared/dateHelpers";
import type { Business, UserData } from "@shared/userData";

export const updateCrtkStatusFactory = (crtkLookupClient: CrtkStatusLookup): UpdateCrtk => {
  return async (userData: UserData, businessDetails: CrtkBusinessDetails): Promise<UserData> => {
    return crtkLookupClient
      .getStatus(businessDetails)
      .then((response) => {
        const updatedBusinessData: Business = {
          ...userData.businesses[userData.currentBusinessId],
          crtkData: {
            ...response,
            lastUpdatedISO: getCurrentDateISOString(),
          },
          taskProgress: {
            ...userData.businesses[userData.currentBusinessId].taskProgress,
            crtk: response.crtkSearchResult === "FOUND" ? "COMPLETED" : "TO_DO",
          },
        };

        const updatedUserData: UserData = {
          ...userData,
          businesses: {
            ...userData.businesses,
            [userData.currentBusinessId]: updatedBusinessData,
          },
        };

        return updatedUserData;
      })
      .catch((error) => {
        throw error;
      });
  };
};
