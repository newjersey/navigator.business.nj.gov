import {
  CigaretteLicenseData,
  EmailConfirmationResponse,
  EmailConfirmationSubmission,
  GetOrderByTokenResponse,
  PreparePaymentApiSubmission,
  PreparePaymentResponse,
} from "@shared/cigaretteLicense";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { UserData } from "@shared/userData";
import { randomUUID } from "node:crypto";

export type CigaretteLicenseApiConfig = {
  baseUrl: string;
  apiKey: string;
  merchantCode: string;
  merchantKey: string;
  serviceCode: string;
  sku: string;
};

export const makePostBody = (
  userData: UserData,
  returnUrl: string,
  config: CigaretteLicenseApiConfig,
): PreparePaymentApiSubmission => {
  const currentBusiness = getCurrentBusiness(userData);
  const cigaretteLicenseData = currentBusiness.cigaretteLicenseData;
  const uniqueId = randomUUID();

  return {
    MerchantCode: config.merchantCode,
    MerchantKey: config.merchantKey,
    ServiceCode: config.serviceCode,
    UniqueTransId: uniqueId,
    LocalRef: uniqueId,
    PaymentType: "CC",
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
    LineItems: [
      {
        Sku: config.sku,
        Description: "CM-100 Cigarette License Application",
        UnitPrice: 50,
        Quantity: 1,
      },
    ],
  };
};

export const makeEmailConfirmationBody = async (
  cigaretteLicenseData: CigaretteLicenseData,
  legalStructureId: string,
  decryptedTaxId: string,
): Promise<EmailConfirmationSubmission> => {
  return {
    businessName: cigaretteLicenseData.businessName || "",
    businessType: legalStructureId,
    responsibleOwnerName: cigaretteLicenseData.responsibleOwnerName || "",
    tradeName: cigaretteLicenseData.tradeName || "",
    taxId: decryptedTaxId,
    addressLine1: cigaretteLicenseData.addressLine1 || "",
    addressLine2: cigaretteLicenseData.addressLine2 || "",
    addressCity: cigaretteLicenseData.addressCity || "",
    addressState: cigaretteLicenseData.addressState?.shortCode || "",
    addressZipCode: cigaretteLicenseData.addressZipCode || "",
    mailingAddressIsTheSame: !!cigaretteLicenseData.mailingAddressIsTheSame,
    mailingAddressLine1: cigaretteLicenseData.mailingAddressLine1 || "",
    mailingAddressLine2: cigaretteLicenseData.mailingAddressLine2 || "",
    mailingAddressCity: cigaretteLicenseData.mailingAddressCity || "",
    mailingAddressState: cigaretteLicenseData.mailingAddressState?.shortCode || "",
    mailingAddressZipCode: cigaretteLicenseData.mailingAddressZipCode || "",
    contactName: cigaretteLicenseData.contactName || "",
    contactPhoneNumber: cigaretteLicenseData.contactPhoneNumber || "",
    contactEmail: cigaretteLicenseData.contactEmail || "",
    salesInfoStartDate: cigaretteLicenseData.salesInfoStartDate || "",
    salesInfoSupplier: cigaretteLicenseData.salesInfoSupplier?.join(", ") || "",
    signerName: cigaretteLicenseData.signerName || "",
    signerRelationship: cigaretteLicenseData.signerRelationship || "",
    signature: !!cigaretteLicenseData.signature,
    paymentInfo: {
      orderId: cigaretteLicenseData.paymentInfo?.orderId || 0,
      orderStatus: cigaretteLicenseData.paymentInfo?.orderStatus || "",
      orderTimestamp: cigaretteLicenseData.paymentInfo?.orderTimestamp || "",
    },
  };
};

export const mockSuccessPostResponse: PreparePaymentResponse = {
  token: "mock-token",
  legacyRedirectUrl: "mock-legacy-redirect-url",
  htmL5RedirectUrl: "mock-html5-redirect-url",
  inContextRedirectUrl: "mock-in-context-redirect-url",
};

export const mockErrorPostResponse: PreparePaymentResponse = {
  token: "",
  errorResult: {
    statusCode: 500,
    errorCode: "139",
    userMessage: "An unknown error occured",
    developerMessage: "An unknown error occured",
  },
};

export const mockSuccessGetResponse: GetOrderByTokenResponse = {
  matchingOrders: 1,
  orders: [{ orderId: 1234, orderStatus: "COMPLETE", timestamp: "now" }],
};

export const mockErrorGetResponse: GetOrderByTokenResponse = {
  matchingOrders: 0,
  errorResult: {
    statusCode: 500,
    errorCode: "139",
    userMessage: "An unknown error occured",
    developerMessage: "An unknown error occured",
  },
};

export const mockSuccessEmailResponse: EmailConfirmationResponse = {
  statusCode: 200,
  message: "Email confirmation successfully sent",
};

export const mockErrorEmailResponse: EmailConfirmationResponse = {
  statusCode: 500,
  message: "Failed to send email confirmation",
};
