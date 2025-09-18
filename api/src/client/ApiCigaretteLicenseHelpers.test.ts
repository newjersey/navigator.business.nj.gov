import {
  CigaretteLicenseApiConfig,
  makeEmailConfirmationBody,
  makePostBody,
} from "@client/ApiCigaretteLicenseHelpers";
import { CigaretteLicenseData, CigaretteLicensePaymentInfo } from "@shared/cigaretteLicense";
import {
  generateBusiness,
  generateCigaretteLicenseData,
  generateUser,
  generateUserData,
} from "@shared/test";
import { randomUUID } from "node:crypto";

jest.mock("node:crypto", () => ({
  randomUUID: jest.fn(),
}));

const mockRandomUUID = randomUUID as jest.MockedFunction<typeof randomUUID>;
const mockUniqueId = "test-uuid-123-456-789";

describe("ApiCigaretteLicenseHelpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRandomUUID.mockReturnValue(mockUniqueId);
  });

  describe("makePostBody", () => {
    const mockConfig: CigaretteLicenseApiConfig = {
      baseUrl: "TEST_BASE_URL",
      apiKey: "TEST_API_KEY",
      merchantCode: "TEST_MERCHANT",
      merchantKey: "TEST_KEY",
      serviceCode: "TEST_SERVICE",
    };

    const returnUrl = "https://example.com/return";

    const mockUserData = generateUserData({
      currentBusinessId: "123",
      user: generateUser({
        id: "user-id1",
        name: "user-name1",
      }),
      businesses: {
        123: generateBusiness({
          cigaretteLicenseData: generateCigaretteLicenseData({}),
        }),
      },
    });
    const currentBusiness = mockUserData.businesses[mockUserData.currentBusinessId];

    it("should create post body with all required fields", () => {
      const result = makePostBody(mockUserData, returnUrl, mockConfig);

      expect(result).toEqual({
        MerchantCode: mockConfig.merchantCode,
        MerchantKey: mockConfig.merchantKey,
        ServiceCode: mockConfig.serviceCode,
        UniqueTransId: mockUniqueId,
        LocalRef: mockUniqueId,
        OrderTotal: 50,
        PaymentType: "CC",
        SuccessUrl: `${returnUrl}?completePayment=success`,
        FailureUrl: `${returnUrl}?completePayment=failure`,
        DuplicateUrl: `${returnUrl}?completePayment=duplicate`,
        CancelUrl: `${returnUrl}?completePayment=cancel`,
        Phone: currentBusiness.cigaretteLicenseData?.contactPhoneNumber,
        Email: currentBusiness.cigaretteLicenseData?.contactEmail,
        CompanyName: currentBusiness.cigaretteLicenseData?.businessName,
        CustomerAddress: {
          Name: currentBusiness.cigaretteLicenseData?.contactName,
          Address1: currentBusiness.cigaretteLicenseData?.addressLine1,
          Address2: currentBusiness.cigaretteLicenseData?.addressLine2,
          City: currentBusiness.cigaretteLicenseData?.addressCity,
          State: currentBusiness.cigaretteLicenseData?.addressState?.shortCode,
          Zip: currentBusiness.cigaretteLicenseData?.addressZipCode,
          Country: "US",
        },
      });
    });

    it("should handle missing cigarette license data gracefully", () => {
      const userData = generateUserData({
        currentBusinessId: "123",
        user: generateUser({
          id: "user-id1",
          name: "user-name1",
        }),
        businesses: {
          123: generateBusiness({
            cigaretteLicenseData: undefined,
          }),
        },
      });

      const result = makePostBody(userData, "https://example.com", mockConfig);

      expect(result.Phone).toBe("");
      expect(result.Email).toBe("");
      expect(result.CompanyName).toBe("");
      expect(result.CustomerAddress.Name).toBe("");
      expect(result.CustomerAddress.Address1).toBe("");
    });

    it("should fall back to responsibleOwnerName when businessName is missing", () => {
      const userData = generateUserData({
        currentBusinessId: "123",
        user: generateUser({
          id: "user-id1",
          name: "user-name1",
        }),
        businesses: {
          123: generateBusiness({
            cigaretteLicenseData: generateCigaretteLicenseData({
              businessName: "",
              responsibleOwnerName: "test-responsible-owner-name",
            }),
          }),
        },
      });
      const result = makePostBody(userData, returnUrl, mockConfig);

      expect(result.CompanyName).toBe("test-responsible-owner-name");
    });

    it("should use randomUUID for both UniqueTransId and LocalRef", () => {
      makePostBody(mockUserData, returnUrl, mockConfig);

      expect(mockRandomUUID).toHaveBeenCalledTimes(1);
    });

    it("should construct correct URLs with return URL", () => {
      const result = makePostBody(mockUserData, returnUrl, mockConfig);

      expect(result.SuccessUrl).toBe(`${returnUrl}?completePayment=success`);
      expect(result.FailureUrl).toBe(`${returnUrl}?completePayment=failure`);
      expect(result.DuplicateUrl).toBe(`${returnUrl}?completePayment=duplicate`);
      expect(result.CancelUrl).toBe(`${returnUrl}?completePayment=cancel`);
    });
  });

  describe("makeEmailConfirmationBody", () => {
    const mockPaymentInfo: CigaretteLicensePaymentInfo = {
      token: "test-token",
      orderId: 12345,
      orderStatus: "COMPLETE",
      orderTimestamp: new Date().toISOString(),
      confirmationEmailsent: false,
    };
    const mockCigaretteLicenseData: CigaretteLicenseData = generateCigaretteLicenseData({
      paymentInfo: mockPaymentInfo,
    });

    it("should create email confirmation body with all fields", async () => {
      const decryptedTaxId =
        mockCigaretteLicenseData.encryptedTaxId?.replace("encrypted-", "") || "";
      const legalStructureId = "limited-liability-corporation";
      const result = await makeEmailConfirmationBody(
        mockCigaretteLicenseData,
        legalStructureId,
        decryptedTaxId,
      );

      expect(result).toEqual({
        businessName: mockCigaretteLicenseData.businessName,
        businessType: legalStructureId,
        responsibleOwnerName: mockCigaretteLicenseData.responsibleOwnerName,
        tradeName: mockCigaretteLicenseData.tradeName,
        taxId: mockCigaretteLicenseData.encryptedTaxId?.replace("encrypted-", ""),
        addressLine1: mockCigaretteLicenseData.addressLine1,
        addressLine2: mockCigaretteLicenseData.addressLine2,
        addressCity: mockCigaretteLicenseData.addressCity,
        addressState: mockCigaretteLicenseData.addressState?.shortCode,
        addressZipCode: mockCigaretteLicenseData.addressZipCode,
        mailingAddressIsTheSame: mockCigaretteLicenseData.mailingAddressIsTheSame,
        mailingAddressLine1: mockCigaretteLicenseData.mailingAddressLine1,
        mailingAddressLine2: mockCigaretteLicenseData.mailingAddressLine2,
        mailingAddressCity: mockCigaretteLicenseData.mailingAddressCity,
        mailingAddressState: mockCigaretteLicenseData.mailingAddressState?.shortCode || "",
        mailingAddressZipCode: mockCigaretteLicenseData.mailingAddressZipCode,
        contactName: mockCigaretteLicenseData.contactName,
        contactPhoneNumber: mockCigaretteLicenseData.contactPhoneNumber,
        contactEmail: mockCigaretteLicenseData.contactEmail,
        salesInfoStartDate: mockCigaretteLicenseData.salesInfoStartDate,
        salesInfoSupplier: mockCigaretteLicenseData.salesInfoSupplier?.join(", "),
        signerName: mockCigaretteLicenseData.signerName,
        signerRelationship: mockCigaretteLicenseData.signerRelationship,
        signature: mockCigaretteLicenseData.signature,
        paymentInfo: {
          orderId: mockPaymentInfo.orderId,
          orderStatus: mockPaymentInfo.orderStatus,
          orderTimestamp: mockPaymentInfo.orderTimestamp,
        },
      });
    });
  });
});
