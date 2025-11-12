import { CRTKStatusLookup, UpdateCRTK } from "@domain/types";
import { CRTKBusinessDetails } from "@shared/crtk";
import { getCurrentDateISOString } from "@shared/dateHelpers";
import { Business, UserData } from "@shared/userData";

export const updateCRTKStatusFactory = (crtkLookupClient: CRTKStatusLookup): UpdateCRTK => {
  return async (userData: UserData, businessDetails: CRTKBusinessDetails): Promise<UserData> => {
    const { businessName, addressLine1, city, addressZipCode } = businessDetails;

    return crtkLookupClient
      .getStatus(businessName, addressLine1, city, addressZipCode)
      .then((response) => {
        const updatedBusinessData: Business = {
          ...userData.businesses[userData.currentBusinessId],
          crtkData: {
            ...response,
            lastUpdatedISO: getCurrentDateISOString(),
          },
          taskProgress: {
            ...userData.businesses[userData.currentBusinessId].taskProgress,
            crtk: response.CRTKSearchResult === "FOUND" ? "COMPLETED" : "TO_DO",
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
