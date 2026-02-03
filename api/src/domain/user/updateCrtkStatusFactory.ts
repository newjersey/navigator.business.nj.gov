import { CrtkBusinessDetails } from "@businessnjgovnavigator/shared";
import { CrtkStatusLookup, UpdateCrtk } from "@domain/types";
import { getCurrentDateISOString } from "@shared/dateHelpers";
import { Business, UserData } from "@shared/userData";

export const updateCrtkStatusFactory = (crtkLookupClient: CrtkStatusLookup): UpdateCrtk => {
  return async (userData: UserData, businessDetails: CrtkBusinessDetails): Promise<UserData> => {
    const { businessName, addressLine1, city, addressZipCode, ein } = businessDetails;

    return crtkLookupClient
      .getStatus(businessName, addressLine1, city, addressZipCode, ein)
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
