import { Business, UserData } from "@shared/userData";
import { FacilityDetails, UpdateXrayRegistration, XrayRegistrationStatusLookup } from "@shared/xray";

export const updateXrayRegistrationStatusFactory = (
  xrayRegistrationLookupClient: XrayRegistrationStatusLookup
): UpdateXrayRegistration => {
  return async (userData: UserData, facilityDetails: FacilityDetails): Promise<UserData> => {
    const { businessName, addressLine1, addressLine2, addressZipCode } = facilityDetails;

    if (!businessName || !addressLine1 || !addressZipCode) {
      throw new Error("Missing required facility details");
    }

    return xrayRegistrationLookupClient
      .getStatus(businessName, addressLine1, addressZipCode)
      .then((response) => {
        console.log("status factory", response);
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
        throw new Error(`Error updating x-ray registration status: ${error.message}`);
      });
  };
};
