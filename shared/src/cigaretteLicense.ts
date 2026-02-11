import { StateObject } from "@businessnjgovnavigator/shared/states";

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
  paymentComplete?: boolean;
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

export const emptyCigaretteLicensePaymentInfo: CigaretteLicensePaymentInfo = {
  token: "",
  paymentComplete: false,
  orderId: undefined,
  orderStatus: "",
  orderTimestamp: "",
  confirmationEmailsent: false,
};

export type SubmissionError = "PAYMENT" | "UNAVAILABLE" | undefined;

export interface PreparePaymentApiSubmission {
  MerchantCode: string;
  MerchantKey: string;
  ServiceCode: string;
  UniqueTransId: string;
  LocalRef: string;
  PaymentType: string;
  SuccessUrl: string;
  FailureUrl: string;
  DuplicateUrl: string;
  CancelUrl: string;
  Phone: string;
  Email: string;
  CompanyName: string;
  CustomerAddress: {
    Name: string;
    Address1: string;
    Address2: string;
    City: string;
    State: string;
    Zip: string;
    Country: string;
  };
  LineItems: {
    Sku: string;
    Description: string;
    UnitPrice: number;
    Quantity: number;
  }[];
}

export interface EmailConfirmationSubmission {
  businessName: string;
  businessType: string;
  responsibleOwnerName: string;
  tradeName: string;
  taxId: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  mailingAddressIsTheSame: boolean;
  mailingAddressLine1: string;
  mailingAddressLine2: string;
  mailingAddressCity: string;
  mailingAddressState: string;
  mailingAddressZipCode: string;
  contactName: string;
  contactPhoneNumber: string;
  contactEmail: string;
  salesInfoStartDate: string;
  salesInfoSupplier: string;
  signerName: string;
  signerRelationship: string;
  signature: boolean;
  paymentInfo: {
    orderId: number;
    orderStatus: string;
    orderTimestamp: string;
  };
}

export type PaymentApiError = {
  statusCode: number;
  errorCode: string;
  userMessage: string;
  developerMessage: string;
  validationErrors?: string[];
};

export type PreparePaymentResponse = {
  token: string;
  statusCode?: number;
  legacyRedirectUrl?: string;
  htmL5RedirectUrl?: string;
  inContextRedirectUrl?: string;
  errorResult?: PaymentApiError;
};

export type GetOrderByTokenResponse = {
  matchingOrders: number;
  orders?: OrderDetails[];
  errorResult?: PaymentApiError;
};

export type OrderDetails = {
  orderId: number;
  orderStatus: string;
  timestamp: string;
};

export type EmailConfirmationResponse = {
  statusCode: number;
  message: string;
};
