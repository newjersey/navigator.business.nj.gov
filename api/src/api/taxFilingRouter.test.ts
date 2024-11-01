/* eslint-disable @typescript-eslint/no-unused-vars */
import { taxFilingRouterFactory } from "@api/taxFilingRouter";
import { getSignedInUserId } from "@api/userRouter";
import { DatabaseClient, EncryptionDecryptionClient, TaxFilingInterface } from "@domain/types";
import { setupExpress } from "@libs/express";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import {
  generateBusiness,
  generateTaxFilingData,
  generateTaxIdAndBusinessName,
  generateUserDataForBusiness,
} from "@shared/test";
import { UserData } from "@shared/userData";
import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

jest.mock("@api/userRouter", () => {
  return {
    getSignedInUserId: jest.fn(),
  };
});
const fakeSignedInUserId = getSignedInUserId as jest.Mock;

describe("taxFilingRouter", () => {
  let app: Express;

  let stubDynamoDataClient: jest.Mocked<DatabaseClient>;
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
    stubDynamoDataClient = {
      migrateData: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
    };
    apiTaxFilingClient = {
      lookup: jest.fn(),
      onboarding: jest.fn(),
    };

    stubEncryptionDecryptionClient = {
      encryptValue: jest.fn(),
      decryptValue: jest.fn(),
    };
    stubDynamoDataClient.get.mockResolvedValue(userData);
    stubDynamoDataClient.put.mockImplementation((userData) => {
      return Promise.resolve(userData);
    });
    app = setupExpress(false);
    app.use(taxFilingRouterFactory(stubDynamoDataClient, apiTaxFilingClient, stubEncryptionDecryptionClient));
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
      expect(stubDynamoDataClient.put).toHaveBeenCalledWith(responseUserData);
      expect(stubDynamoDataClient.get).toHaveBeenCalledWith("some-id");
      expect(response.status).toEqual(StatusCodes.OK);
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
      expect(stubDynamoDataClient.put).toHaveBeenCalledWith(responseUserData);
      expect(stubDynamoDataClient.get).toHaveBeenCalledWith("some-id");
      expect(response.status).toEqual(StatusCodes.OK);
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
      expect(stubDynamoDataClient.put).toHaveBeenCalledWith(responseUserData);
      expect(stubDynamoDataClient.get).toHaveBeenCalledWith("some-id");
      expect(response.status).toEqual(StatusCodes.OK);
    });

    it("returns INTERNAL SERVER ERROR if taxId is masked and there is no encryptedTaxId", async () => {
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({
        businessName: "my-cool-business",
        taxId: "*****89000",
        encryptedTaxId: undefined,
      });
      apiTaxFilingClient.lookup.mockResolvedValue(responseUserData);
      const response = await request(app).post(`/lookup`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
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
      expect(stubDynamoDataClient.put).toHaveBeenCalledWith(responseUserData);
      expect(stubDynamoDataClient.get).toHaveBeenCalledWith("some-id");
      expect(response.status).toEqual(StatusCodes.OK);
    });

    it("returns INTERNAL SERVER ERROR on interface error", async () => {
      apiTaxFilingClient.lookup.mockRejectedValue(new Error(StatusCodes.INTERNAL_SERVER_ERROR.toString()));
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      const response = await request(app).post(`/lookup`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it("returns INTERNAL SERVER ERROR on userDataClient put error", async () => {
      apiTaxFilingClient.lookup.mockResolvedValue(responseUserData);
      stubDynamoDataClient.put.mockRejectedValue(new Error(StatusCodes.INTERNAL_SERVER_ERROR.toString()));
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      const response = await request(app).post(`/lookup`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(apiTaxFilingClient.lookup).toHaveBeenCalled();
    });

    it("returns INTERNAL SERVER ERROR on userDataClient get error", async () => {
      apiTaxFilingClient.lookup.mockResolvedValue(responseUserData);
      stubDynamoDataClient.get.mockRejectedValue(new Error(StatusCodes.INTERNAL_SERVER_ERROR.toString()));
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      const response = await request(app).post(`/lookup`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(apiTaxFilingClient.lookup).not.toHaveBeenCalled();
    });
  });

  describe("/onboarding", () => {
    it("returns userData", async () => {
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      apiTaxFilingClient.onboarding.mockResolvedValue(responseUserData);
      const response = await request(app).post(`/onboarding`).send(taxIdAndBusinessName);
      expect(stubDynamoDataClient.put).toHaveBeenCalledWith(responseUserData);
      expect(stubDynamoDataClient.get).toHaveBeenCalledWith("some-id");
      expect(response.status).toEqual(StatusCodes.OK);
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
      expect(stubDynamoDataClient.put).toHaveBeenCalledWith(responseUserData);
      expect(stubDynamoDataClient.get).toHaveBeenCalledWith("some-id");
      expect(response.status).toEqual(StatusCodes.OK);
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
      expect(stubDynamoDataClient.put).toHaveBeenCalledWith(responseUserData);
      expect(stubDynamoDataClient.get).toHaveBeenCalledWith("some-id");
      expect(response.status).toEqual(StatusCodes.OK);
    });

    it("returns INTERNAL SERVER ERROR on client error", async () => {
      apiTaxFilingClient.onboarding.mockRejectedValue(
        new Error(StatusCodes.INTERNAL_SERVER_ERROR.toString())
      );
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      const response = await request(app).post(`/onboarding`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    });

    it("returns INTERNAL SERVER ERROR on userDataClient put error", async () => {
      apiTaxFilingClient.onboarding.mockResolvedValue(responseUserData);
      stubDynamoDataClient.put.mockRejectedValue(new Error(StatusCodes.INTERNAL_SERVER_ERROR.toString()));
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      const response = await request(app).post(`/onboarding`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(apiTaxFilingClient.onboarding).toHaveBeenCalled();
    });

    it("returns INTERNAL SERVER ERROR on userDataClient get error", async () => {
      apiTaxFilingClient.onboarding.mockResolvedValue(responseUserData);
      stubDynamoDataClient.get.mockRejectedValue(new Error(StatusCodes.INTERNAL_SERVER_ERROR.toString()));
      const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
      const response = await request(app).post(`/onboarding`).send(taxIdAndBusinessName);
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(apiTaxFilingClient.onboarding).not.toHaveBeenCalled();
    });
  });
});
