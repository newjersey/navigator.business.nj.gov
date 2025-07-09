import { StateObject } from "./states";

export interface CigaretteLicenseAddress {
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState?: StateObject;
  addressZipCode: string;
}

export const emptyCigaretteLicenseAddress: CigaretteLicenseAddress = {
  addressLine1: "",
  addressLine2: "",
  addressCity: "",
  addressState: undefined,
  addressZipCode: "",
};

export interface CigaretteLicenseData {
  businessName?: string;
  responsibleOwnerName?: string;
  tradeName?: string;
  taxId: string;
  encryptedTaxId: string;
  businessAddress: CigaretteLicenseAddress;
  mailingAddressIsTheSame: boolean;
  mailingAddress?: CigaretteLicenseAddress;
  contactName: string;
  contactPhoneNumber: string;
  contactEmail: string;
  salesInfoStartDate: string;
  salesInfoSupplier: string[];
  lastUpdatedISO?: string;
}

export const emptyCigaretteLicenseData: CigaretteLicenseData = {
  businessName: "",
  responsibleOwnerName: "",
  tradeName: "",
  taxId: "",
  encryptedTaxId: "",
  businessAddress: emptyCigaretteLicenseAddress,
  mailingAddressIsTheSame: false,
  mailingAddress: emptyCigaretteLicenseAddress,
  contactName: "",
  contactPhoneNumber: "",
  contactEmail: "",
  salesInfoStartDate: "",
  salesInfoSupplier: [],
  lastUpdatedISO: undefined,
};
