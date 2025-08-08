import { getCurrentBusiness } from "@shared/index";
import { ApiCigaretteLicenseClient } from "@client/ApiCigaretteLicenseClient";
import {
  CigaretteLicenseApiConfig,
  makePostBody,
  mockSuccessPostResponse,
  mockSuccessGetResponse,
  mockErrorGetResponse,
  mockErrorPostResponse,
  makeEmailConfirmationBody,
  mockSuccessEmailResponse,
  mockErrorEmailResponse,
} from "@client/ApiCigaretteLicenseHelpers";
import { PreparePaymentApiSubmission } from "@shared/cigaretteLicense";

import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import { CigaretteLicenseClient } from "@domain/types";
import { DummyLogWriter } from "@libs/logWriter";
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

describe("CigaretteLicenseClient", () => {
  const config: CigaretteLicenseApiConfig = {
    baseUrl: "www.test.com",
    apiKey: "fakeApiKey",
    merchantCode: "fakeMerchantCode",
    merchantKey: "fakeMerchantKey",
    serviceCode: "fakeServiceCode",
    emailConfirmationUrl: "www.test-email.com",
    emailConfirmationKey: "fake-email-key",
  };
  const returnUrl = "fake-return-url";
  const decryptedTaxId = "decrypted-tax-id";
  let client: CigaretteLicenseClient;
  let userData: UserData;
  let postBody: PreparePaymentApiSubmission;

  beforeEach(() => {
    jest.resetAllMocks();
    client = ApiCigaretteLicenseClient(DummyLogWriter, config);

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
      expect(mockAxios.post).toHaveBeenCalledWith("www.test.com/tokens", postBody, {
        headers: {
          "Content-Type": "application/json",
          ApiKey: config.apiKey,
        },
      });
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
      expect(result.errorResult?.errorCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);

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
      expect(mockAxios.get).toHaveBeenCalledWith(`www.test.com/tokens/${token}`, {
        headers: {
          "Content-Type": "application/json",
          ApiKey: config.apiKey,
          MerchantCode: config.merchantCode,
          MerchantKey: config.merchantKey,
        },
      });
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
      expect(result.errorResult?.errorCode).toBe(StatusCodes.INTERNAL_SERVER_ERROR);

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
    it("makes request to correct url with auth and data", async () => {
      mockAxios.post.mockResolvedValue({ data: "Email confirmation successfully sent" });
      const currentBusiness = getCurrentBusiness(userData);
      const cigaretteLicenseData = currentBusiness.cigaretteLicenseData!;

      const emailPostBody = await makeEmailConfirmationBody(cigaretteLicenseData, decryptedTaxId);
      await client.sendEmailConfirmation(userData, decryptedTaxId);
      expect(mockAxios.post).toHaveBeenCalledWith(config.emailConfirmationUrl, emailPostBody, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.emailConfirmationKey,
        },
      });
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

    it("returns response of 200 and success message if confirmaiton is successful", async () => {
      mockAxios.post.mockResolvedValue({
        status: 200,
        data: "Email confirmation successfully sent",
      });
      const response = await client.sendEmailConfirmation(userData, decryptedTaxId);

      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.message).toEqual(mockSuccessEmailResponse.message);
    });

    it("returns response of 500 and error message if an uknown error occurs", async () => {
      mockAxios.post.mockRejectedValue(mockErrorEmailResponse);
      const response = await client.sendEmailConfirmation(userData, decryptedTaxId);

      expect(response.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.message).toEqual(mockErrorEmailResponse.message);
    });
  });
});
