import { StateObject } from "./states";

export interface CigaretteLicenseData {
  businessName?: string;
  responsibleOwnerName?: string;
  tradeName?: string;
  taxId?: string;
  encryptedTaxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: StateObject;
  addressZipCode?: string;
  mailingAddressIsTheSame?: boolean;
  mailingAddressLine1?: string;
  mailingAddressLine2?: string;
  mailingAddressCity?: string;
  mailingAddressState?: StateObject;
  mailingAddressZipCode?: string;
  contactName?: string;
  contactPhoneNumber?: string;
  contactEmail?: string;
  salesInfoStartDate?: string;
  salesInfoSupplier?: string[];
  signerName?: string;
  signerRelationship?: string;
  signature?: boolean;
  lastUpdatedISO?: string;
  paymentInfo?: CigaretteLicensePaymentInfo;
}

export type CigaretteLicensePaymentInfo = {
  token?: string;
  orderId?: number;
  orderStatus?: string;
  orderTimestamp?: string;
  confirmationEmailsent?: boolean;
};

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
  signerName: "",
  signerRelationship: "",
  signature: false,
};

export const emptyCigaretteLicensePaymentInfo = {
  token: "",
  orderId: undefined,
  orderStatus: "",
  orderTimestamp: "",
  confirmationEmailsent: false,
};
