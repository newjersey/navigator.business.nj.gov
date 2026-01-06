import {
  ApiTaxClearanceCertificateClient,
  BUSINESS_STATUS_VERIFICATION_ERROR,
  FAILED_TAX_ID_AND_PIN_VALIDATION,
  INELIGIBLE_TAX_CLEARANCE_FORM,
  MISSING_FIELD,
  NATURAL_PROGRAM_ERROR,
  TAX_ID_MISSING_FIELD,
  TAX_ID_MISSING_FIELD_WITH_EXTRA_SPACE,
} from "@client/ApiTaxClearanceCertificateClient";
import { type CryptoClient, DatabaseClient, TaxClearanceCertificateClient } from "@domain/types";
import { DummyLogWriter } from "@libs/logWriter";
import {
  emptyTaxClearanceCertificateData,
  LookupTaxClearanceCertificateAgenciesById,
} from "@shared/taxClearanceCertificate";
import {
  generateBusiness,
  generateTaxClearanceCertificateData,
  generateUser,
  generateUserData,
} from "@shared/test";
import { Business, UserData } from "@shared/userData";
import axios from "axios";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("TaxClearanceCertificateClient", () => {
  const config = {
    orgUrl: "www.test.com",
    userName: "fakeUserName",
    password: "fakePassword",
  };
  let client: TaxClearanceCertificateClient;
  let stubEncryptionDecryptionClient: jest.Mocked<CryptoClient>;
  let stubDatabaseClient: jest.Mocked<DatabaseClient>;
  let userData: UserData;

  const createExpectedUserData = (baseUserData: UserData): UserData => ({
    ...baseUserData,
    businesses: {
      ...baseUserData.businesses,
      "123": {
        ...baseUserData.businesses["123"],
        taxClearanceCertificateData: {
          ...emptyTaxClearanceCertificateData,
          ...baseUserData.businesses["123"].taxClearanceCertificateData,
          hasPreviouslyReceivedCertificate: true,
          lastUpdatedISO: new Date().toISOString(),
        },
      },
    },
  });

  beforeEach(() => {
    jest.resetAllMocks();
    client = ApiTaxClearanceCertificateClient(DummyLogWriter, config);
    stubEncryptionDecryptionClient = {
      encryptValue: jest.fn(),
      decryptValue: jest.fn((value) => {
        return new Promise((resolve) => {
          resolve(value.replace("encrypted-", ""));
        });
      }),
      hashValue: jest.fn(),
    };
    stubDatabaseClient = {
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
      findUserByBusinessName: jest.fn(),
      findUsersByBusinessNamePrefix: jest.fn(),
      findBusinessesByHashedTaxId: jest.fn(),
      migrateOutdatedVersionUsers: jest.fn(),
    };

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
          taxClearanceCertificateData: generateTaxClearanceCertificateData({}),
        }),
      },
    });

    stubDatabaseClient.get.mockResolvedValue(userData);
    stubDatabaseClient.findBusinessesByHashedTaxId.mockResolvedValue([]);

    mockAxios.post.mockResolvedValue({ data: { certificate: [1] } });
  });

  it("returns error when another business has previously received a certificate", async () => {
    const mockHashedTaxId = "test-hashed-tax-id";
    const businessWithCertificate = generateBusiness({
      id: "other-business-id",
      profileData: {
        ...generateBusiness({}).profileData,
        businessName: "Other Business",
        hashedTaxId: mockHashedTaxId,
      },
      taxClearanceCertificateData: {
        ...generateTaxClearanceCertificateData({}),
        hasPreviouslyReceivedCertificate: true,
      },
    });

    stubDatabaseClient.findBusinessesByHashedTaxId.mockResolvedValue([businessWithCertificate]);

    const result = await client.postTaxClearanceCertificate(
      userData,
      stubEncryptionDecryptionClient,
      stubDatabaseClient,
    );

    expect(result).toEqual({
      error: {
        type: "TAX_ID_IN_USE_BY_ANOTHER_BUSINESS_ACCOUNT",
        message: `Business has previously received a tax clearance certificate.`,
      },
    });
  });

  it("makes a post request to correct url with basic auth and data", async () => {
    const generatedTaxClearanceCertificateData =
      userData.businesses["123"].taxClearanceCertificateData!;

    await client.postTaxClearanceCertificate(
      userData,
      stubEncryptionDecryptionClient,
      stubDatabaseClient,
    );
    expect(mockAxios.post).toHaveBeenCalledWith(
      "www.test.com/TYTR_ACE_App/ProcessCertificate/businessClearance",
      {
        repId: "user-id1",
        repName: "user-name1",
        taxpayerId: generatedTaxClearanceCertificateData.encryptedTaxId?.replace("encrypted-", ""),
        taxpayerName: generatedTaxClearanceCertificateData.businessName,
        addressLine1: generatedTaxClearanceCertificateData.addressLine1,
        addressLine2: generatedTaxClearanceCertificateData.addressLine2,
        city: generatedTaxClearanceCertificateData.addressCity,
        state: generatedTaxClearanceCertificateData.addressState?.shortCode,
        zip: generatedTaxClearanceCertificateData.addressZipCode,
        taxpayerPin: generatedTaxClearanceCertificateData.encryptedTaxPin?.replace(
          "encrypted-",
          "",
        ),
        agencyName: LookupTaxClearanceCertificateAgenciesById(
          generatedTaxClearanceCertificateData.requestingAgencyId,
        ).name,
      },
      {
        auth: { password: "fakePassword", username: "fakeUserName" },
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  });

  it("fires all logs when successful api response is returned", async () => {
    const generatedTaxClearanceCertificateData =
      userData.businesses["123"].taxClearanceCertificateData!;
    const postBody = {
      repId: userData.user.id,
      repName: userData.user.name,
      taxpayerId: generatedTaxClearanceCertificateData.encryptedTaxId?.replace("encrypted-", ""),
      taxpayerPin: generatedTaxClearanceCertificateData.encryptedTaxPin?.replace("encrypted-", ""),
      taxpayerName: generatedTaxClearanceCertificateData.businessName,
      addressLine1: generatedTaxClearanceCertificateData.addressLine1,
      addressLine2: generatedTaxClearanceCertificateData.addressLine2,
      city: generatedTaxClearanceCertificateData.addressCity,
      state: generatedTaxClearanceCertificateData.addressState?.shortCode,
      zip: generatedTaxClearanceCertificateData.addressZipCode,
      agencyName: LookupTaxClearanceCertificateAgenciesById(
        generatedTaxClearanceCertificateData.requestingAgencyId,
      ).name,
    };

    const spyOnGetId = jest.spyOn(DummyLogWriter, "GetId").mockReturnValue("test");
    const spyOnLogInfo = jest.spyOn(DummyLogWriter, "LogInfo");
    mockAxios.post.mockResolvedValue({ data: { certificate: [11, 22] } });
    await client.postTaxClearanceCertificate(
      userData,
      stubEncryptionDecryptionClient,
      stubDatabaseClient,
    );

    expect(spyOnGetId).toHaveBeenCalled();
    expect(spyOnLogInfo.mock.calls[0][0]).toEqual("Tax Clearance Certificate Client - Id:test");
    expect(spyOnLogInfo.mock.calls[1][0]).toEqual(
      `Tax Clearance Certificate Client - Id:test - Request Sent to ${
        config.orgUrl
      }/TYTR_ACE_App/ProcessCertificate/businessClearance data: ${JSON.stringify(postBody)}`,
    );
    expect(spyOnLogInfo.mock.calls[2][0]).toEqual(
      `Tax Clearance Certificate Client - Id:test - Response received: ${JSON.stringify({
        certificate: "Successful Response - PDF data omitted",
      })}`,
    );

    spyOnGetId.mockRestore();
    spyOnLogInfo.mockRestore();
  });

  it("returns certificate pdf array and updated user data", async () => {
    const NOW = "2000-01-01T10:00:00.000Z";
    jest.useFakeTimers();
    jest.setSystemTime(new Date(NOW));

    mockAxios.post.mockResolvedValue({ data: { certificate: [11, 22] } });
    const result = await client.postTaxClearanceCertificate(
      userData,
      stubEncryptionDecryptionClient,
      stubDatabaseClient,
    );

    if ("error" in result) {
      throw new Error("Expected successful response");
    }

    const expectedUserData = createExpectedUserData(userData);
    expect(result).toEqual({
      certificatePdfArray: [11, 22],
      userData: expectedUserData,
    });

    jest.useRealTimers();
  });

  it("fires error log when error response is returned", async () => {
    const error = {
      response: { status: StatusCodes.BAD_REQUEST, data: FAILED_TAX_ID_AND_PIN_VALIDATION },
    };

    const spyOnGetId = jest.spyOn(DummyLogWriter, "GetId").mockReturnValue("test");
    const spyOnLogError = jest.spyOn(DummyLogWriter, "LogError");
    mockAxios.post.mockRejectedValue(error);

    const result = await client.postTaxClearanceCertificate(
      userData,
      stubEncryptionDecryptionClient,
      stubDatabaseClient,
    );

    expect(result).toEqual({
      error: {
        message: FAILED_TAX_ID_AND_PIN_VALIDATION,
        type: "FAILED_TAX_ID_AND_PIN_VALIDATION",
      },
    });

    expect(spyOnLogError.mock.calls[0]).toEqual([
      "Tax Clearance Certificate Client - Id:test - Error: FAILED_TAX_ID_AND_PIN_VALIDATION,",
      {
        response: { status: StatusCodes.BAD_REQUEST, data: FAILED_TAX_ID_AND_PIN_VALIDATION },
      },
    ]);

    spyOnGetId.mockRestore();
    spyOnLogError.mockRestore();
  });

  it("removes auth object when logging error", async () => {
    const error = {
      response: { status: StatusCodes.BAD_REQUEST, data: INELIGIBLE_TAX_CLEARANCE_FORM },
      config: { auth: { username: "username", password: "password" } },
    };

    const spyOnGetId = jest.spyOn(DummyLogWriter, "GetId").mockReturnValue("test");
    const spyOnLogError = jest.spyOn(DummyLogWriter, "LogError");
    mockAxios.post.mockRejectedValue(error);

    const result = await client.postTaxClearanceCertificate(
      userData,
      stubEncryptionDecryptionClient,
      stubDatabaseClient,
    );

    expect(result).toEqual({
      error: {
        message: INELIGIBLE_TAX_CLEARANCE_FORM,
        type: "INELIGIBLE_TAX_CLEARANCE_FORM",
      },
    });

    expect(spyOnLogError.mock.calls[0]).toEqual([
      "Tax Clearance Certificate Client - Id:test - Error: INELIGIBLE_TAX_CLEARANCE_FORM,",
      {
        response: { status: StatusCodes.BAD_REQUEST, data: INELIGIBLE_TAX_CLEARANCE_FORM },
        config: {},
      },
    ]);

    spyOnGetId.mockRestore();
    spyOnLogError.mockRestore();
  });

  it("throws error when receiving a response without a certificate property", async () => {
    mockAxios.post.mockResolvedValue({
      response: { data: {} },
    });
    await expect(
      client.postTaxClearanceCertificate(
        userData,
        stubEncryptionDecryptionClient,
        stubDatabaseClient,
      ),
    ).rejects.toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it("throws error when error response is unknown", async () => {
    mockAxios.post.mockRejectedValue({
      response: { status: StatusCodes.INTERNAL_SERVER_ERROR },
    });
    await expect(
      client.postTaxClearanceCertificate(
        userData,
        stubEncryptionDecryptionClient,
        stubDatabaseClient,
      ),
    ).rejects.toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it("returns INELIGIBLE_TAX_CLEARANCE_FORM error", async () => {
    mockAxios.post.mockRejectedValue({
      response: { status: StatusCodes.BAD_REQUEST, data: INELIGIBLE_TAX_CLEARANCE_FORM },
    });
    expect(
      await client.postTaxClearanceCertificate(
        userData,
        stubEncryptionDecryptionClient,
        stubDatabaseClient,
      ),
    ).toEqual({
      error: {
        message: INELIGIBLE_TAX_CLEARANCE_FORM,
        type: "INELIGIBLE_TAX_CLEARANCE_FORM",
      },
    });
  });

  it("returns FAILED_TAX_ID_AND_PIN_VALIDATION error", async () => {
    mockAxios.post.mockRejectedValue({
      response: { status: StatusCodes.BAD_REQUEST, data: FAILED_TAX_ID_AND_PIN_VALIDATION },
    });
    expect(
      await client.postTaxClearanceCertificate(
        userData,
        stubEncryptionDecryptionClient,
        stubDatabaseClient,
      ),
    ).toEqual({
      error: {
        message: FAILED_TAX_ID_AND_PIN_VALIDATION,
        type: "FAILED_TAX_ID_AND_PIN_VALIDATION",
      },
    });
  });

  it("returns BUSINESS_STATUS_VERIFICATION_ERROR error", async () => {
    mockAxios.post.mockRejectedValue({
      response: { status: StatusCodes.BAD_REQUEST, data: BUSINESS_STATUS_VERIFICATION_ERROR },
    });
    expect(
      await client.postTaxClearanceCertificate(
        userData,
        stubEncryptionDecryptionClient,
        stubDatabaseClient,
      ),
    ).toEqual({
      error: {
        message: BUSINESS_STATUS_VERIFICATION_ERROR,
        type: "BUSINESS_STATUS_VERIFICATION_ERROR",
      },
    });
  });

  it("returns NATURAL_PROGRAM_ERROR error", async () => {
    mockAxios.post.mockRejectedValue({
      response: { status: StatusCodes.BAD_REQUEST, data: NATURAL_PROGRAM_ERROR },
    });
    expect(
      await client.postTaxClearanceCertificate(
        userData,
        stubEncryptionDecryptionClient,
        stubDatabaseClient,
      ),
    ).toEqual({
      error: {
        message: NATURAL_PROGRAM_ERROR,
        type: "NATURAL_PROGRAM_ERROR",
      },
    });
  });

  it("returns MISSING_FIELD error", async () => {
    mockAxios.post.mockRejectedValue({
      response: { status: StatusCodes.BAD_REQUEST, data: MISSING_FIELD },
    });
    expect(
      await client.postTaxClearanceCertificate(
        userData,
        stubEncryptionDecryptionClient,
        stubDatabaseClient,
      ),
    ).toEqual({
      error: {
        message: MISSING_FIELD,
        type: "MISSING_FIELD",
      },
    });
  });

  it("returns TAX_ID_MISSING_FIELD error", async () => {
    mockAxios.post.mockRejectedValue({
      response: { status: StatusCodes.BAD_REQUEST, data: TAX_ID_MISSING_FIELD },
    });
    expect(
      await client.postTaxClearanceCertificate(
        userData,
        stubEncryptionDecryptionClient,
        stubDatabaseClient,
      ),
    ).toEqual({
      error: {
        message: TAX_ID_MISSING_FIELD,
        type: "MISSING_FIELD",
      },
    });
  });

  it("returns TAX_ID_MISSING_FIELD_WITH_EXTRA_SPACE error", async () => {
    mockAxios.post.mockRejectedValue({
      response: { status: StatusCodes.BAD_REQUEST, data: TAX_ID_MISSING_FIELD_WITH_EXTRA_SPACE },
    });
    expect(
      await client.postTaxClearanceCertificate(
        userData,
        stubEncryptionDecryptionClient,
        stubDatabaseClient,
      ),
    ).toEqual({
      error: {
        message: TAX_ID_MISSING_FIELD_WITH_EXTRA_SPACE,
        type: "MISSING_FIELD",
      },
    });
  });

  describe("unlink tax ID api request", () => {
    const originalEnvironment = process.env.STAGE;

    afterEach(() => {
      process.env.STAGE = originalEnvironment;
    });

    it("is enabled in non-prod env", async () => {
      process.env.STAGE = "dev";
      const mockHashedTaxId = "test-hashed-tax-id";
      const businessWithCertificate: Business = generateBusiness({
        id: "other-business-id",
        profileData: {
          ...generateBusiness({}).profileData,
          businessName: "Other Business",
          hashedTaxId: mockHashedTaxId,
        },
        taxClearanceCertificateData: {
          ...generateTaxClearanceCertificateData({}),
          hasPreviouslyReceivedCertificate: true,
        },
        userId: "user-id2",
      });

      stubDatabaseClient.findBusinessesByHashedTaxId.mockResolvedValue([businessWithCertificate]);

      const result = await client.unlinkTaxId(userData, stubDatabaseClient);

      expect(stubDatabaseClient.put).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
      });
    });

    it("is disabled in prod env", async () => {
      process.env.STAGE = "prod";
      const mockHashedTaxId = "test-hashed-tax-id";
      const businessWithCertificate: Business = generateBusiness({
        id: "other-business-id",
        profileData: {
          ...generateBusiness({}).profileData,
          businessName: "Other Business",
          hashedTaxId: mockHashedTaxId,
        },
        taxClearanceCertificateData: {
          ...generateTaxClearanceCertificateData({}),
          hasPreviouslyReceivedCertificate: true,
        },
        userId: "user-id2",
      });

      stubDatabaseClient.findBusinessesByHashedTaxId.mockResolvedValue([businessWithCertificate]);

      const result = await client.unlinkTaxId(userData, stubDatabaseClient);

      expect(stubDatabaseClient.put).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: { message: "This function isn't allowed in prod environment" },
      });
    });
  });

  describe("health", () => {
    it("returns a passing health check if data can be retrieved successfully", async () => {
      mockAxios.post.mockResolvedValue({ data: { certificate: [1] } });
      expect(await client.health()).toEqual({ success: true, data: { message: "OK" } });
    });

    it("returns a passing health check if service returns a 400 and 'FAILED_TAX_ID_AND_PIN_VALIDATION' error message", async () => {
      mockAxios.post.mockRejectedValue({
        status: StatusCodes.BAD_REQUEST,
        response: { data: FAILED_TAX_ID_AND_PIN_VALIDATION },
      });
      expect(await client.health()).toEqual({ success: true, data: { message: "OK" } });
    });

    it("returns a failing health check if data might be an HTML firewall response", async () => {
      mockAxios.post.mockResolvedValue({
        data: { "0": "<", "1": "h", "2": "t", "3": "m", "4": "l" },
      });
      expect(await client.health()).toEqual({
        success: false,
        error: {
          message: ReasonPhrases.BAD_GATEWAY,
          timeout: false,
        },
      });
    });

    it("returns a failing health check if unexpected data is retrieved", async () => {
      mockAxios.post.mockRejectedValue({
        response: { status: StatusCodes.NOT_FOUND },
        message: "",
      });
      expect(await client.health()).toEqual({
        success: false,
        error: {
          message: ReasonPhrases.BAD_GATEWAY,
          serverResponseBody: "",
          serverResponseCode: StatusCodes.NOT_FOUND,
          timeout: false,
        },
      });
    });

    it("returns a failing health check if axios request times out", async () => {
      mockAxios.post.mockRejectedValue({});
      expect(await client.health()).toEqual({
        success: false,
        error: {
          message: ReasonPhrases.GATEWAY_TIMEOUT,
          timeout: true,
        },
      });
    });
  });
});
