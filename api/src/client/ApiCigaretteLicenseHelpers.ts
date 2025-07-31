import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { UserData } from "@shared/userData";
import { v4 as uuidv4 } from "uuid";

export type CigaretteLicenseApiConfig = {
  baseUrl: string;
  apiKey: string;
  merchantCode: string;
  merchantKey: string;
  serviceCode: string;
};

export const makePostBody = (
  userData: UserData,
  config: CigaretteLicenseApiConfig,
): PreparePaymentApiSubmission => {
  const currentBusiness = getCurrentBusiness(userData);
  const cigaretteLicenseData = currentBusiness.cigaretteLicenseData;

  return {
    MerchantCode: config.merchantCode,
    MerchantKey: config.merchantKey,
    ServiceCode: config.serviceCode,
    UniqueTransId: uuidv4(),
    LocalRef: uuidv4(),
    OrderTotal: 50,
    PaymentType: "CC",
    // TODO: Define these urls
    SuccessUrl: "",
    FailureUrl: "",
    DuplicateUrl: "",
    CancelUrl: "",
    Phone: cigaretteLicenseData?.contactPhoneNumber || "",
    Email: cigaretteLicenseData?.contactEmail || "",
    CompanyName:
      cigaretteLicenseData?.businessName || cigaretteLicenseData?.responsibleOwnerName || "",
    CustomerAddress: {
      Name: cigaretteLicenseData?.contactName || "",
      Address1: cigaretteLicenseData?.addressLine1 || "",
      Address2: cigaretteLicenseData?.addressLine2 || "",
      City: cigaretteLicenseData?.addressCity || "",
      State: cigaretteLicenseData?.addressState?.shortCode || "",
      Zip: cigaretteLicenseData?.addressZipCode || "",
      Country: "US",
    },
  };
};

export interface PreparePaymentApiSubmission {
  MerchantCode: string;
  MerchantKey: string;
  ServiceCode: string;
  UniqueTransId: string;
  LocalRef: string;
  OrderTotal: number;
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
}

export type CigaretteLicensePaymentApiError = {
  statusCode: number;
  errorCode: number;
  userMessage: string;
  developerMessage: string;
};

export type CigaretteLicensePreparePaymentResponse = {
  token: string;
  legacyRedirectUrl?: string;
  htmL5RedirectUrl?: string;
  InContextRedirectUrl?: string;
  errorResult?: CigaretteLicensePaymentApiError;
};

export type CigaretteLicenseGetOrderByTokenResponse = {
  matchingOrders: number;
  orders?: CigaretteLicenseOrderDetails[];
  errorResult?: CigaretteLicensePaymentApiError;
};

export type CigaretteLicenseOrderDetails = {
  serviceName: string;
  orderAmount: number;
  orderId: number;
  orderStatus: string;
  timestamp: string;
};
