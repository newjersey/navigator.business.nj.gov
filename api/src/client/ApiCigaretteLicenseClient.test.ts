import { ApiCigaretteLicenseClient } from "@client/ApiCigaretteLicenseClient";
import {
  CigaretteLicenseApiConfig,
  makeEmailConfirmationBody,
  makePostBody,
  mockErrorEmailResponse,
  mockErrorGetResponse,
  mockErrorPostResponse,
  mockSuccessEmailResponse,
  mockSuccessGetResponse,
  mockSuccessPostResponse,
} from "@client/ApiCigaretteLicenseHelpers";
import { PreparePaymentApiSubmission } from "@shared/cigaretteLicense";
import { getCurrentBusiness } from "@shared/index";

import { CigaretteLicenseClient, EmailClient } from "@domain/types";
import { DummyLogWriter } from "@libs/logWriter";
import { CIGARETTE_PAYMENT_CONFIG_VARS, getConfigValue } from "@libs/ssmUtils";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import {
  generateBusiness,
  generateCigaretteLicenseData,
  generateUser,
  generateUserData,
} from "@shared/test";
import { UserData } from "@shared/userData";
import axios from "axios";
import { StatusCodes } from "http-status-codes";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;
jest.mock("node:crypto", () => ({
  randomUUID: (): string => "fake-uuid-value",
}));
jest.mock("@libs/ssmUtils", () => ({
  getConfigValue: jest.fn(),
  isKillSwitchOn: jest.fn(),
  updateKillSwitch: jest.fn(),
}));

const mockGetConfigValue = getConfigValue as jest.MockedFunction<
  (paramName: CIGARETTE_PAYMENT_CONFIG_VARS) => Promise<string>
>;

const mockEmailClient: jest.Mocked<EmailClient> = {
  sendEmail: jest.fn(),
  health: jest.fn(),
};

describe("CigaretteLicenseClient", () => {
  const mockValues = {
    cigarette_license_base_url: "https://test-api.example.com",
    cigarette_license_api_key: "test-api-key",
    cigarette_license_merchant_code: "TEST_MERCHANT",
    cigarette_license_merchant_key: "test-merchant-key",
    cigarette_license_service_code: "TEST_SERVICE",
    cigarette_license_sku: "TEST_SKU",
  };
  const config: CigaretteLicenseApiConfig = {
    baseUrl: mockValues.cigarette_license_base_url,
    apiKey: mockValues.cigarette_license_api_key,
    merchantCode: mockValues.cigarette_license_merchant_code,
    merchantKey: mockValues.cigarette_license_merchant_key,
    serviceCode: mockValues.cigarette_license_service_code,
    sku: mockValues.cigarette_license_sku,
  };
  const returnUrl = "fake-return-url";
  const decryptedTaxId = "decrypted-tax-id";
  let client: CigaretteLicenseClient;
  let userData: UserData;
  let postBody: PreparePaymentApiSubmission;

  beforeEach(() => {
    jest.resetAllMocks();
    client = ApiCigaretteLicenseClient(mockEmailClient, DummyLogWriter);
    mockGetConfigValue.mockImplementation((param) => {
      return Promise.resolve(mockValues[param] || "");
    });

    userData = generateUserData({
      currentBusinessId: "123",
      user: generateUser({
        id: "user-id1",
        name: "user-name1",
      }),
      businesses: {
        123: generateBusiness({
          profileData: {
            ...generateBusiness({}).profileData,
            hashedTaxId: "test-hashed-tax-id",
          },
          cigaretteLicenseData: generateCigaretteLicenseData({}),
        }),
      },
    });
    postBody = makePostBody(userData, returnUrl, config);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("prepare-payment", () => {
    beforeEach(() => {
      mockAxios.post.mockResolvedValue({ data: mockSuccessPostResponse });
    });

    it("makes request to correct url with auth and data", async () => {
      await client.preparePayment(userData, returnUrl);
      expect(mockAxios.post).toHaveBeenCalledWith(
        `${mockValues.cigarette_license_base_url}/tokens`,
        postBody,
        {
          headers: {
            "Content-Type": "application/json",
            ApiKey: config.apiKey,
          },
        },
      );
    });

    it("fires all logs request when successful api response is returned", async () => {
      const spyOnGetId = jest.spyOn(DummyLogWriter, "GetId").mockReturnValue("test");
      const spyOnLogInfo = jest.spyOn(DummyLogWriter, "LogInfo");
      await client.preparePayment(userData, returnUrl);

      expect(spyOnGetId).toHaveBeenCalled();
      expect(spyOnLogInfo.mock.calls[0][0]).toEqual(
        `Cigarette License Client - Id:test - Sending request to ${
          config.baseUrl
        }/tokens data: ${JSON.stringify(postBody)}`,
      );
      expect(spyOnLogInfo.mock.calls[1][0]).toEqual(
        `Cigarette License Client - Id:test - Response received: ${JSON.stringify(mockSuccessPostResponse)}`,
      );

      spyOnGetId.mockRestore();
      spyOnLogInfo.mockRestore();
    });

    it("fires error logs for request when error response is returned", async () => {
      const spyOnGetId = jest.spyOn(DummyLogWriter, "GetId").mockReturnValue("test");
      const spyOnLogError = jest.spyOn(DummyLogWriter, "LogError");
      mockAxios.post.mockRejectedValue(mockErrorPostResponse);

      const result = await client.preparePayment(userData, returnUrl);

      expect(result.errorResult).toBeDefined();
      expect(result.errorResult?.errorCode).toBe(mockErrorPostResponse.errorResult?.errorCode);

      expect(spyOnLogError.mock.calls[0]).toEqual([
        `Cigarette License Client - Id:test - Unknown error received: ${JSON.stringify(mockErrorPostResponse)}`,
      ]);

      spyOnGetId.mockRestore();
      spyOnLogError.mockRestore();
    });

    it("returns token and redirect URL when successful api response is returned", async () => {
      const response = await client.preparePayment(userData, returnUrl);

      expect(response.token).not.toBeNull();
      expect(response.token).toEqual(mockSuccessPostResponse.token);
      expect(response.legacyRedirectUrl).not.toBeNull();
      expect(response.legacyRedirectUrl).toEqual(mockSuccessPostResponse.legacyRedirectUrl);
      expect(response.htmL5RedirectUrl).not.toBeNull();
      expect(response.htmL5RedirectUrl).toEqual(mockSuccessPostResponse.htmL5RedirectUrl);
    });

    it("returns errorResult object when error occurs", async () => {
      mockAxios.post.mockRejectedValue(mockErrorPostResponse);
      const response = await client.preparePayment(userData, returnUrl);

      expect(response.token).toEqual("");
      expect(response.errorResult).not.toBeNull();
      expect(response.errorResult?.errorCode).toEqual(mockErrorPostResponse.errorResult?.errorCode);
      expect(response.errorResult?.userMessage).toEqual(
        mockErrorPostResponse.errorResult?.userMessage,
      );
    });
  });

  describe("get-order-by-token", () => {
    const token = "mock-token";

    beforeEach(() => {
      mockAxios.get.mockResolvedValue({ data: mockSuccessGetResponse });
    });

    it("makes request to correct url with auth and data", async () => {
      await client.getOrderByToken(token);
      expect(mockAxios.get).toHaveBeenCalledWith(
        `${mockValues.cigarette_license_base_url}/tokens/${token}`,
        {
          headers: {
            "Content-Type": "application/json",
            ApiKey: config.apiKey,
            MerchantCode: config.merchantCode,
            MerchantKey: config.merchantKey,
          },
        },
      );
    });

    it("fires all logs request when successful api response is returned", async () => {
      const spyOnGetId = jest.spyOn(DummyLogWriter, "GetId").mockReturnValue("test");
      const spyOnLogInfo = jest.spyOn(DummyLogWriter, "LogInfo");
      await client.getOrderByToken(token);

      expect(spyOnGetId).toHaveBeenCalled();
      expect(spyOnLogInfo.mock.calls[0][0]).toEqual(
        `Cigarette License Client - Id:test - Sending request to ${config.baseUrl}/tokens/${token}}`,
      );
      expect(spyOnLogInfo.mock.calls[1][0]).toEqual(
        `Cigarette License Client - Id:test - Response received: ${JSON.stringify(mockSuccessGetResponse)}`,
      );

      spyOnGetId.mockRestore();
      spyOnLogInfo.mockRestore();
    });

    it("fires error logs for request when error response is returned", async () => {
      const spyOnGetId = jest.spyOn(DummyLogWriter, "GetId").mockReturnValue("test");
      const spyOnLogError = jest.spyOn(DummyLogWriter, "LogError");
      mockAxios.get.mockRejectedValue(mockErrorGetResponse);

      const result = await client.getOrderByToken(token);

      expect(result.errorResult).toBeDefined();
      expect(result.errorResult?.errorCode).toBe(mockErrorGetResponse.errorResult?.errorCode);

      expect(spyOnLogError.mock.calls[0]).toEqual([
        `Cigarette License Client - Id:test - Unknown error received: ${JSON.stringify(mockErrorGetResponse)}`,
      ]);

      spyOnGetId.mockRestore();
      spyOnLogError.mockRestore();
    });

    it("returns order details when successful api response is returned", async () => {
      const response = await client.getOrderByToken(token);

      expect(response.matchingOrders).not.toBeNull();
      expect(response.matchingOrders).toEqual(1);
      expect(response.orders).not.toBeNull();
    });

    it("returns errorResult object when error occurs", async () => {
      mockAxios.get.mockRejectedValue(mockErrorGetResponse);
      const response = await client.getOrderByToken(token);

      expect(response.matchingOrders).toEqual(0);
      expect(response.errorResult).not.toBeNull();
      expect(response.errorResult?.errorCode).toEqual(mockErrorGetResponse.errorResult?.errorCode);
      expect(response.errorResult?.userMessage).toEqual(
        mockErrorGetResponse.errorResult?.userMessage,
      );
    });
  });

  describe("send-email-confirmation", () => {
    it("sends email with relevant user data", async () => {
      const currentBusiness = getCurrentBusiness(userData);
      const legalStructureId = currentBusiness.profileData.legalStructureId || "";
      const cigaretteLicenseData = currentBusiness.cigaretteLicenseData!;

      const emailPostBody = await makeEmailConfirmationBody(
        cigaretteLicenseData,
        legalStructureId,
        decryptedTaxId,
      );
      await client.sendEmailConfirmation(userData, decryptedTaxId);

      expect(mockEmailClient.sendEmail).toHaveBeenCalledWith(emailPostBody);
    });

    it("returns an error response of 400 if the cigaretteLicenseData doesn't exist", async () => {
      const userWithoutCigaretteData = modifyCurrentBusiness(userData, (business) => ({
        ...business,
        cigaretteLicenseData: undefined,
      }));
      const response = await client.sendEmailConfirmation(userWithoutCigaretteData, decryptedTaxId);
      expect(response.statusCode).toEqual(400);
      expect(response.message).toEqual(
        `The cigaretteLicenseData is not defined for user ${userData.user.id}`,
      );
    });

    it("returns an error response of 409 if the cigarette license confirmation email has already been sent", async () => {
      const userAlreadySentConfirmation = modifyCurrentBusiness(userData, (business) => ({
        ...business,
        cigaretteLicenseData: {
          ...business.cigaretteLicenseData,
          paymentInfo: {
            ...business.cigaretteLicenseData?.paymentInfo,
            confirmationEmailsent: true,
          },
        },
      }));
      const response = await client.sendEmailConfirmation(
        userAlreadySentConfirmation,
        decryptedTaxId,
      );
      expect(response.statusCode).toEqual(409);
      expect(response.message).toEqual(
        `The cigarette license confirmation email has already been sent for for user ${userData.user.id}`,
      );
    });

    it.each([
      [
        { statusCode: StatusCodes.OK, message: "Email confirmation successfully sent" },
        StatusCodes.OK,
        mockSuccessEmailResponse.message,
      ],
      [
        {
          statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
          message: "Failed to send email confirmation",
        },
        StatusCodes.INTERNAL_SERVER_ERROR,
        mockErrorEmailResponse.message,
      ],
    ])(
      "returns response of email client for status %s",
      async (mockResponse, expectedStatus, expectedMessage) => {
        mockEmailClient.sendEmail.mockResolvedValue(mockResponse);
        const response = await client.sendEmailConfirmation(userData, decryptedTaxId);
        expect(response.statusCode).toEqual(expectedStatus);
        expect(response.message).toEqual(expectedMessage);
      },
    );
  });
});
