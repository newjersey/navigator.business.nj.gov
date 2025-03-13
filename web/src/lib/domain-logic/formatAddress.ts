import { FormationAddress } from "@businessnjgovnavigator/shared";

export const formatAddress = (address: Partial<FormationAddress>): string => {
  return `${address.addressLine1},${address.addressLine2 ? ` ${address.addressLine2},` : ""} ${
    address.addressMunicipality?.displayName ?? address.addressCity
  }, ${address.addressState?.name} ${address.addressZipCode}`;
};
