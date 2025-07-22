import { StateObject } from "./states";

export interface CigaretteLicenseData {
  businessName?: string;
  responsibleOwnerName?: string;
  tradeName?: string;
  taxId: string;
  encryptedTaxId: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState?: StateObject;
  addressZipCode: string;
  mailingAddressIsTheSame: boolean;
  mailingAddressLine1: string;
  mailingAddressLine2: string;
  mailingAddressCity: string;
  mailingAddressState?: StateObject;
  mailingAddressZipCode: string;
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
  addressLine1: "",
  addressLine2: "",
  addressCity: "",
  addressState: undefined,
  addressZipCode: "",
  mailingAddressIsTheSame: false,
  mailingAddressLine1: "",
  mailingAddressLine2: "",
  mailingAddressCity: "",
  mailingAddressState: undefined,
  mailingAddressZipCode: "",
  contactName: "",
  contactPhoneNumber: "",
  contactEmail: "",
  salesInfoStartDate: "",
  salesInfoSupplier: [],
  lastUpdatedISO: undefined,
};
