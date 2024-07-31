import { BusinessIdAndLicenseSearchAddresses } from "@client/dynamics/license-status/types";
import { NO_MATCH_ERROR } from "@domain/types";
import { LicenseSearchAddress } from "@shared/license";

export const searchBusinessAddressesForMatch = (
  businessIdsAndLicenseAddresses: BusinessIdAndLicenseSearchAddresses[],
  nameAndAddress: LicenseSearchAddress
): string => {
  const result: string[] = [];

  const isAddressMatch = (
    address: LicenseSearchAddress,
    userInputtedAddress: LicenseSearchAddress
  ): boolean => {
    return (
      userInputtedAddress.addressLine1 === address.addressLine1 &&
      address.zipCode === userInputtedAddress.zipCode
    );
  };

  for (const { businessId, addresses } of businessIdsAndLicenseAddresses) {
    for (const address of addresses) {
      if (isAddressMatch(address, nameAndAddress)) {
        result.push(businessId);
        break;
      }
    }
  }

  if (result.length !== 1) throw new Error(NO_MATCH_ERROR);
  return result[0];
};
