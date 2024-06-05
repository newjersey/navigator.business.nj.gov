/* eslint-disable @typescript-eslint/no-unused-vars */
import { taxFilingRouterFactory } from "@api/taxFilingRouter";
import { getSignedInUserId } from "@api/userRouter";
import { EncryptionDecryptionClient, TaxFilingInterface, UserDataClient } from "@domain/types";
import { setupExpress } from "@libs/express";
import {
  generateBusiness,
  generateTaxFilingData,
  generateTaxIdAndBusinessName,
  generateUserDataForBusiness,
  modifyCurrentBusiness,
} from "@shared/test";
import { UserData } from "@shared/userData";
import { Express } from "express";
import request from "supertest";

jest.mock("./userRouter", () => {
  return {
    getSignedInUserId: jest.fn(),
  };
});
const fakeSignedInUserId = getSignedInUserId as jest.Mock;

describe("taxFilingRouter", () => {
  let app: Express;

  let stubUserDataClient: jest.Mocked<UserDataClient>;
  let apiTaxFilingClient: jest.Mocked<TaxFilingInterface>;
  let stubEncryptionDecryptionClient: jest.Mocked<EncryptionDecryptionClient>;
  const userData = generateUserDataForBusiness(
    generateBusiness({ taxFilingData: generateTaxFilingData({ state: "PENDING" }) })
  );
  const responseUserData: UserData = modifyCurrentBusiness(userData, (business) => ({
    ...business,
    taxFilingData: generateTaxFilingData({ state: "SUCCESS" }),
  }));

  beforeEach(async () => {
    jest.resetAllMocks();
    fakeSignedInUserId.mockReturnValue("some-id");

    stubUserDataClient = {
      get: jest.fn(),
      findByEmail: jest.fn(),
      put: jest.fn(),
      getNeedNewsletterUsers: jest.fn(),
      getNeedToAddToUserTestingUsers: jest.fn(),
      getNeedTaxIdEncryptionUsers: jest.fn(),
    };

    apiTaxFilingClient = {
      lookup: jest.fn(),
      onboarding: jest.fn(),
    };

    stubEncryptionDecryptionClient = {
      encryptValue: jest.fn(),
      decryptValue: jest.fn(),
    };
    stubUserDataClient.get.mockResolvedValue(userData);
    stubUserDataClient.put.mockImplementation((userData) => {
      return Promise.resolve(userData);
    });
    app = setupExpress(false);
    app.use(taxFilingRouterFactory(stubUserDataClient, apiTaxFilingClient, stubEncryptionDecryptionClient));
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      return setTimeout(resolve, 500);
    });
  });

  describe("/lookup", () => {
    it("returns userData", async () => {
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({
        businessName: "my-cool-business",
        taxId: "123456789000",
      });
      apiTaxFilingClient.lookup.mockResolvedValue(responseUserData);
      const response = await request(app).post(`/lookup`).send(taxIdAndBusinessName);
      expect(response.body).toEqual(responseUserData);
      expect(stubUserDataClient.put).toHaveBeenCalledWith(responseUserData);
      expect(stubUserDataClient.get).toHaveBeenCalledWith("some-id");
      expect(response.status).toEqual(200);
    });

    it("uses the values in taxId field if it is plaintext and encrypted field is empty", async () => {
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({
        businessName: "my-cool-business",
        taxId: "123456789000",
        encryptedTaxId: undefined,
      });
      apiTaxFilingClient.lookup.mockResolvedValue(responseUserData);
      const response = await request(app).post(`/lookup`).send(taxIdAndBusinessName);
      expect(response.body).toEqual(responseUserData);
      expect(apiTaxFilingClient.lookup).toHaveBeenCalledWith({
        userData,
        taxId: "123456789000",
        businessName: "my-cool-business",
      });
      expect(stubUserDataClient.put).toHaveBeenCalledWith(responseUserData);
      expect(stubUserDataClient.get).toHaveBeenCalledWith("some-id");
      expect(response.status).toEqual(200);
    });

    it("uses the values in taxId field if it is plaintext and encrypted field is populated", async () => {
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({
        businessName: "my-cool-business",
        taxId: "123456789000",
        encryptedTaxId: "some-encrypted-value",
      });
      apiTaxFilingClient.lookup.mockResolvedValue(responseUserData);
      const response = await request(app).post(`/lookup`).send(taxIdAndBusinessName);
      expect(response.body).toEqual(responseUserData);
      expect(apiTaxFilingClient.lookup).toHaveBeenCalledWith({
        userData,
        taxId: "123456789000",
        businessName: "my-cool-business",
      });
      expect(stubUserDataClient.put).toHaveBeenCalledWith(responseUserData);
      expect(stubUserDataClient.get).toHaveBeenCalledWith("some-id");
      expect(response.status).toEqual(200);
    });

    it("returns 500 error if taxId is masked and there is no encryptedTaxId", async () => {
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({
        businessName: "my-cool-business",
        taxId: "*****89000",
        encryptedTaxId: undefined,
      });
      apiTaxFilingClient.lookup.mockResolvedValue(responseUserData);
      const response = await request(app).post(`/lookup`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(500);
    });

    it("decrypts the taxId field using the encryptedTaxId field if it is masked", async () => {
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({
        businessName: "my-cool-business",
        taxId: "*****89000",
        encryptedTaxId: "some-encrypted-value",
      });
      apiTaxFilingClient.lookup.mockResolvedValue(responseUserData);
      stubEncryptionDecryptionClient.decryptValue.mockResolvedValue("123456789000");
      const response = await request(app).post(`/lookup`).send(taxIdAndBusinessName);
      expect(response.body).toEqual(responseUserData);
      expect(stubEncryptionDecryptionClient.decryptValue).toHaveBeenCalledWith("some-encrypted-value");
      expect(apiTaxFilingClient.lookup).toHaveBeenCalledWith({
        userData,
        taxId: "123456789000",
        businessName: "my-cool-business",
      });
      expect(stubUserDataClient.put).toHaveBeenCalledWith(responseUserData);
      expect(stubUserDataClient.get).toHaveBeenCalledWith("some-id");
      expect(response.status).toEqual(200);
    });

    it("returns 500 on interface error", async () => {
      apiTaxFilingClient.lookup.mockRejectedValue(new Error("500"));
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      const response = await request(app).post(`/lookup`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(500);
    });

    it("returns 500 on userDataClient put error", async () => {
      apiTaxFilingClient.lookup.mockResolvedValue(responseUserData);
      stubUserDataClient.put.mockRejectedValue(new Error("500"));
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      const response = await request(app).post(`/lookup`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(500);
      expect(apiTaxFilingClient.lookup).toHaveBeenCalled();
    });

    it("returns 500 on userDataClient get error", async () => {
      apiTaxFilingClient.lookup.mockResolvedValue(responseUserData);
      stubUserDataClient.get.mockRejectedValue(new Error("500"));
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      const response = await request(app).post(`/lookup`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(500);
      expect(apiTaxFilingClient.lookup).not.toHaveBeenCalled();
    });
  });

  describe("/onboarding", () => {
    it("returns userData", async () => {
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      apiTaxFilingClient.onboarding.mockResolvedValue(responseUserData);
      const response = await request(app).post(`/onboarding`).send(taxIdAndBusinessName);
      expect(stubUserDataClient.put).toHaveBeenCalledWith(responseUserData);
      expect(stubUserDataClient.get).toHaveBeenCalledWith("some-id");
      expect(response.status).toEqual(200);
    });

    it("uses the values in taxId field if it is plaintext and encrypted field is empty", async () => {
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({
        businessName: "my-cool-business",
        taxId: "123456789000",
        encryptedTaxId: undefined,
      });
      apiTaxFilingClient.onboarding.mockResolvedValue(responseUserData);
      const response = await request(app).post(`/onboarding`).send(taxIdAndBusinessName);
      expect(response.body).toEqual(responseUserData);
      expect(apiTaxFilingClient.onboarding).toHaveBeenCalledWith({
        userData,
        ...taxIdAndBusinessName,
      });
      expect(stubUserDataClient.put).toHaveBeenCalledWith(responseUserData);
      expect(stubUserDataClient.get).toHaveBeenCalledWith("some-id");
      expect(response.status).toEqual(200);
    });

    it("decrypts the taxId field using the encryptedTaxId field if it is masked", async () => {
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({
        businessName: "my-cool-business",
        taxId: "*****89000",
        encryptedTaxId: "some-encrypted-value",
      });
      stubEncryptionDecryptionClient.decryptValue.mockResolvedValue("123456789000");
      apiTaxFilingClient.onboarding.mockResolvedValue(responseUserData);
      const response = await request(app).post(`/onboarding`).send(taxIdAndBusinessName);
      expect(response.body).toEqual(responseUserData);
      expect(apiTaxFilingClient.onboarding).toHaveBeenCalledWith({
        userData,
        taxId: "123456789000",
        businessName: "my-cool-business",
      });
      expect(stubEncryptionDecryptionClient.decryptValue).toHaveBeenCalledWith("some-encrypted-value");
      expect(stubUserDataClient.put).toHaveBeenCalledWith(responseUserData);
      expect(stubUserDataClient.get).toHaveBeenCalledWith("some-id");
      expect(response.status).toEqual(200);
    });

    it("returns 500 on client error", async () => {
      apiTaxFilingClient.onboarding.mockRejectedValue(new Error("500"));
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      const response = await request(app).post(`/onboarding`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(500);
    });

    it("returns 500 on userDataClient put error", async () => {
      apiTaxFilingClient.onboarding.mockResolvedValue(responseUserData);
      stubUserDataClient.put.mockRejectedValue(new Error("500"));
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      const response = await request(app).post(`/onboarding`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(500);
      expect(apiTaxFilingClient.onboarding).toHaveBeenCalled();
    });

    it("returns 500 on userDataClient get error", async () => {
      apiTaxFilingClient.onboarding.mockResolvedValue(responseUserData);
      stubUserDataClient.get.mockRejectedValue(new Error("500"));
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      const response = await request(app).post(`/onboarding`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(500);
      expect(apiTaxFilingClient.onboarding).not.toHaveBeenCalled();
    });
  });
});
