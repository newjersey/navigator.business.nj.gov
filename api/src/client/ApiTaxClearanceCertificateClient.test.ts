import {
  ApiTaxClearanceCertificateClient,
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
import { UserData } from "@shared/userData";
import axios from "axios";
import { StatusCodes } from "http-status-codes";

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
  });

  it("fires error log when error response is returned", async () => {
    const error = {
      response: { status: StatusCodes.BAD_REQUEST, data: "Error Message" },
    };

    const spyOnGetId = jest.spyOn(DummyLogWriter, "GetId").mockReturnValue("test");
    const spyOnLogError = jest.spyOn(DummyLogWriter, "LogError");
    mockAxios.post.mockRejectedValue(error);
    await expect(
      client.postTaxClearanceCertificate(
        userData,
        stubEncryptionDecryptionClient,
        stubDatabaseClient,
      ),
    ).rejects.toEqual(StatusCodes.BAD_REQUEST);

    expect(spyOnLogError.mock.calls[0]).toEqual([
      "Tax Clearance Certificate Client - Id:test - Error",
      error,
    ]);

    spyOnGetId.mockRestore();
    spyOnLogError.mockRestore();
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
});
