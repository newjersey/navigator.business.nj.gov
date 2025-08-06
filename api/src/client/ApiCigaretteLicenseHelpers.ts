import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { UserData } from "@shared/userData";
import { v4 as uuidv4 } from "uuid";

export type CigaretteLicenseApiConfig = {
  baseUrl: string;
  emailConfirmationUrl: string;
  apiKey: string;
  merchantCode: string;
  merchantKey: string;
  serviceCode: string;
};

export const makePostBody = (
  userData: UserData,
  returnUrl: string,
  config: CigaretteLicenseApiConfig,
): PreparePaymentApiSubmission => {
  const currentBusiness = getCurrentBusiness(userData);
  const cigaretteLicenseData = currentBusiness.cigaretteLicenseData;
  const uniqueId = uuidv4();

  return {
    MerchantCode: config.merchantCode,
    MerchantKey: config.merchantKey,
    ServiceCode: config.serviceCode,
    UniqueTransId: uniqueId,
    LocalRef: uniqueId,
    OrderTotal: 50,
    PaymentType: "CC",
    // TODO: Define these urls
    SuccessUrl: `${returnUrl}?completePayment=success`,
    FailureUrl: `${returnUrl}?completePayment=failure`,
    DuplicateUrl: `${returnUrl}?completePayment=duplicate`,
    CancelUrl: `${returnUrl}?completePayment=cancel`,
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
  inContextRedirectUrl?: string;
  errorResult?: CigaretteLicensePaymentApiError;
};

export type CigaretteLicenseGetOrderByTokenResponse = {
  matchingOrders: number;
  orders?: CigaretteLicenseOrderDetails[];
  errorResult?: CigaretteLicensePaymentApiError;
};

export type CigaretteLicenseOrderDetails = {
  orderId: number;
  orderStatus: string;
  timestamp: string;
};

export const mockSuccessPostResponse: CigaretteLicensePreparePaymentResponse = {
  token: "mock-token",
  legacyRedirectUrl: "mock-legacy-redirect-url",
  htmL5RedirectUrl: "mock-html5-redirect-url",
  inContextRedirectUrl: "mock-in-context-redirect-url",
};
export const mockErrorPostResponse: CigaretteLicensePreparePaymentResponse = {
  token: "",
  errorResult: {
    statusCode: 500,
    errorCode: 500,
    userMessage: "An unknown error occured",
    developerMessage: "An unknown error occured",
  },
};
export const mockSuccessGetResponse: CigaretteLicenseGetOrderByTokenResponse = {
  matchingOrders: 1,
  orders: [{ orderId: 1234, orderStatus: "COMPLETE", timestamp: "now" }],
};
export const mockErrorGetResponse: CigaretteLicenseGetOrderByTokenResponse = {
  matchingOrders: 0,
  errorResult: {
    statusCode: 500,
    errorCode: 500,
    userMessage: "An unknown error occured",
    developerMessage: "An unknown error occured",
  },
};
