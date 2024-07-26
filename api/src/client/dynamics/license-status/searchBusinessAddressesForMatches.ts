import {
  BusinessIdAndLicenseSearchNameAndAddresses,
  BusinessIdAndName,
} from "@client/dynamics/license-status/rgbLicenseStatusTypes";
import { NO_ADDRESS_MATCH_ERROR } from "@domain/types";
import { LicenseSearchAddress } from "@shared/license";

export const searchBusinessAddressesForMatches = (
  businessIdsAndLicenseAddresses: BusinessIdAndLicenseSearchNameAndAddresses[],
  nameAndAddress: LicenseSearchAddress
): BusinessIdAndName[] => {
  const result: BusinessIdAndName[] = [];

  const isAddressMatch = (
    address: LicenseSearchAddress,
    userInputtedAddress: LicenseSearchAddress
  ): boolean => {
    return (
      userInputtedAddress.addressLine1 === address.addressLine1 &&
      userInputtedAddress.zipCode === address.zipCode
    );
  };

  // TODO: Pick whichever is easier to read

  // for (const { businessId, addresses, name } of businessIdsAndLicenseAddresses) {
  //   for (const address of addresses) {
  //     if (isAddressMatch(address, nameAndAddress)) {
  //       result.push({
  //         businessId,
  //         name,
  //       });
  //       break;
  //     }
  //   }
  // }

  for (const { businessId, name } of businessIdsAndLicenseAddresses.filter(
    ({ businessId, addresses, name }) =>
      addresses.some(
        (address) =>
          isAddressMatch(address, nameAndAddress) &&
          !result.some((item) => item.businessId === businessId && item.name === name)
      )
  ))
    result.push({ businessId, name });

  if (result.length === 0) throw new Error(NO_ADDRESS_MATCH_ERROR);
  return result;
};
