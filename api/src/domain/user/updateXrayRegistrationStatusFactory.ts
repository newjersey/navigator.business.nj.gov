import { UpdateXrayRegistration, XrayRegistrationStatusLookup } from "@domain/types";
import { Business, UserData } from "@shared/userData";
import { FacilityDetails } from "@shared/xray";

export const updateXrayRegistrationStatusFactory = (
  xrayRegistrationLookupClient: XrayRegistrationStatusLookup,
): UpdateXrayRegistration => {
  return async (userData: UserData, facilityDetails: FacilityDetails): Promise<UserData> => {
    const { businessName, addressLine1, addressLine2, addressZipCode } = facilityDetails;
    return xrayRegistrationLookupClient
      .getStatus(businessName, addressLine1, addressZipCode)
      .then((response) => {
        const updatedBusinessData: Business = {
          ...userData.businesses[userData.currentBusinessId],
          xrayRegistrationData: {
            ...response,
            facilityDetails: {
              businessName: businessName,
              addressLine1: addressLine1,
              addressLine2: addressLine2,
              addressZipCode: addressZipCode,
            },
          },
          taskProgress: {
            ...userData.businesses[userData.currentBusinessId].taskProgress,
            "xray-reg": "COMPLETED",
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
