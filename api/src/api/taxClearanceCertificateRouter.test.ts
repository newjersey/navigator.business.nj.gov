import { taxClearanceCertificateRouterFactory } from "@api/taxClearanceCertificateRouter";
import { type CryptoClient, DatabaseClient, TaxClearanceCertificateClient } from "@domain/types";
import { setupExpress } from "@libs/express";
import { DummyLogWriter } from "@libs/logWriter";
import { generateUserData } from "@shared/test";
import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import request from "supertest";

describe("taxClearanceCertificateRouterFactory", () => {
  let app: Express;
  let stubTaxClearanceCertificateClient: jest.Mocked<TaxClearanceCertificateClient>;
  let stubCryptoClient: jest.Mocked<CryptoClient>;
  let stubDynamoDataClient: jest.Mocked<DatabaseClient>;

  beforeEach(() => {
    jest.resetAllMocks();
    stubTaxClearanceCertificateClient = {
      postTaxClearanceCertificate: jest.fn(),
      health: jest.fn(),
      unlinkTaxId: jest.fn(),
    };
    stubCryptoClient = {
      encryptValue: jest.fn(),
      decryptValue: jest.fn(),
      hashValue: jest.fn(),
    };
    stubDynamoDataClient = {
      migrateOutdatedVersionUsers: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
      findUserByBusinessName: jest.fn(),
      findUsersByBusinessNamePrefix: jest.fn(),
      findBusinessesByHashedTaxId: jest.fn(),
    };
    app = setupExpress(false);
    app.use(
      taxClearanceCertificateRouterFactory(
        stubTaxClearanceCertificateClient,
        stubCryptoClient,
        stubDynamoDataClient,
        DummyLogWriter,
      ),
    );
  });

  it("returns a successful response", async () => {
    const userData = generateUserData({});
    stubTaxClearanceCertificateClient.postTaxClearanceCertificate.mockResolvedValue({
      certificatePdfArray: [12],
      userData,
    });
    const response = await request(app).post(`/postTaxClearanceCertificate`);
    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body).toEqual({ certificatePdfArray: [12], userData });
  });

  it("throws a server error", async () => {
    stubTaxClearanceCertificateClient.postTaxClearanceCertificate.mockRejectedValue("some value");
    const response = await request(app).post(`/postTaxClearanceCertificate`);
    expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(response.body).toEqual({ error: "some value" });
  });

  describe("unlinkTaxId", () => {
    beforeEach(() => {
      process.env.DEV_ONLY_UNLINK_TAX_ID = "true";
    });

    it("returns an error if DEV_ONLY_UNLINK_TAX_ID is not enabled", async () => {
      process.env.DEV_ONLY_UNLINK_TAX_ID = "false";
      const response = await request(app).post(`/unlinkTaxId`);
      expect(response.status).toEqual(StatusCodes.UNAUTHORIZED);
    });

    it("returns a successful response", async () => {
      stubTaxClearanceCertificateClient.unlinkTaxId.mockResolvedValue({
        success: true,
      });
      const response = await request(app).post(`/unlinkTaxId`);
      expect(response.status).toEqual(StatusCodes.OK);
      expect(response.body).toEqual({ success: true });
    });

    it("throws a server error", async () => {
      stubTaxClearanceCertificateClient.unlinkTaxId.mockRejectedValue("some value");
      const response = await request(app).post(`/unlinkTaxId`);
      expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.body).toEqual({ error: "some value" });
    });
  });
});
