import {
  ApiTaxClearanceCertificateClient,
  FAILED_TAX_ID_AND_PIN_VALIDATION,
  INELIGIBLE_TAX_CLEARANCE_FORM,
  MISSING_FIELD,
  SYSTEM_ERROR,
  TAX_ID_MISSING_FIELD,
  TAX_ID_MISSING_FIELD_WITH_EXTRA_SPACE,
} from "@client/ApiTaxClearanceCertificateClient";
import { TaxClearanceCertificateClient } from "@domain/types";
import { DummyLogWriter } from "@libs/logWriter";
import { LookupTaxClearanceCertificateAgenciesById } from "@shared/taxClearanceCertificate";
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
  let userData: UserData;

  beforeEach(() => {
    jest.resetAllMocks();
    client = ApiTaxClearanceCertificateClient(DummyLogWriter, config);
    userData = generateUserData({});
    mockAxios.post.mockResolvedValue({ data: {} });
  });

  it("makes a post request to correct url with basic auth and data", () => {
    const generatedTaxClearanceCertificateData = generateTaxClearanceCertificateData({});
    const userData = generateUserData({
      currentBusinessId: "123",
      user: generateUser({
        id: "user-id1",
        name: "user-name1",
      }),
      businesses: {
        123: generateBusiness({
          taxClearanceCertificateData: generatedTaxClearanceCertificateData,
        }),
      },
    });

    client.postTaxClearanceCertificate(userData);
    expect(mockAxios.post).toHaveBeenCalledWith(
      "www.test.com/TYTR_ACE_App/ProcessCertificate/businessClearance",
      {
        repId: "user-id1",
        repName: "user-name1",
        taxpayerId: generatedTaxClearanceCertificateData.taxId,
        taxpayerName: generatedTaxClearanceCertificateData.businessName,
        addressLine1: generatedTaxClearanceCertificateData.addressLine1,
        addressLine2: generatedTaxClearanceCertificateData.addressLine2,
        city: generatedTaxClearanceCertificateData.addressCity,
        state: generatedTaxClearanceCertificateData.addressState?.shortCode,
        zip: generatedTaxClearanceCertificateData.addressZipCode,
        taxpayerPin: generatedTaxClearanceCertificateData.taxPin,
        agencyName: LookupTaxClearanceCertificateAgenciesById(
          generatedTaxClearanceCertificateData.requestingAgencyId
        ).name,
      },
      {
        auth: { password: "fakePassword", username: "fakeUserName" },
      }
    );
  });

  it("fires all logs when successful api response is returned", async () => {
    const generatedTaxClearanceCertificateData = generateTaxClearanceCertificateData({});
    const userData = generateUserData({
      currentBusinessId: "123",
      user: generateUser({
        id: "user-id1",
        name: "user-name1",
      }),
      businesses: {
        123: generateBusiness({
          taxClearanceCertificateData: generatedTaxClearanceCertificateData,
        }),
      },
    });
    const postBody = {
      repId: userData.user.id,
      repName: userData.user.name,
      taxpayerId: generatedTaxClearanceCertificateData.taxId,
      taxpayerPin: generatedTaxClearanceCertificateData.taxPin,
      taxpayerName: generatedTaxClearanceCertificateData.businessName,
      addressLine1: generatedTaxClearanceCertificateData.addressLine1,
      addressLine2: generatedTaxClearanceCertificateData.addressLine2,
      city: generatedTaxClearanceCertificateData.addressCity,
      state: generatedTaxClearanceCertificateData.addressState?.shortCode,
      zip: generatedTaxClearanceCertificateData.addressZipCode,
      agencyName: LookupTaxClearanceCertificateAgenciesById(
        generatedTaxClearanceCertificateData.requestingAgencyId
      ).name,
    };

    const spyOnGetId = jest.spyOn(DummyLogWriter, "GetId").mockReturnValue("test");
    const spyOnLogInfo = jest.spyOn(DummyLogWriter, "LogInfo");
    mockAxios.post.mockResolvedValue({ data: { certificate: [11, 22] } });
    await client.postTaxClearanceCertificate(userData);

    expect(spyOnGetId).toHaveBeenCalled();
    expect(spyOnLogInfo.mock.calls[0][0]).toEqual("Tax Clearance Certificate Client - Id:test");
    expect(spyOnLogInfo.mock.calls[1][0]).toEqual(
      `Tax Clearance Certificate Client - Id:test - Request Sent to ${
        config.orgUrl
      }/TYTR_ACE_App/ProcessCertificate/businessClearance data: ${JSON.stringify(postBody)}`
    );
    expect(spyOnLogInfo.mock.calls[2][0]).toEqual(
      `Tax Clearance Certificate Client - Id:test - Response received: ${JSON.stringify({
        certificate: "Succussful Response - PDF data omitted",
      })}`
    );

    spyOnGetId.mockRestore();
    spyOnLogInfo.mockRestore();
  });

  it("returns certificate pdf array", async () => {
    mockAxios.post.mockResolvedValue({ data: { certificate: [11, 22] } });
    const result = await client.postTaxClearanceCertificate(userData);
    expect(result).toEqual({ certificatePdfArray: [11, 22] });
  });

  it("fires error log when error response is returned", async () => {
    const userData = generateUserData({});
    const error = {
      response: { status: StatusCodes.BAD_REQUEST, data: "Error Message" },
    };

    const spyOnGetId = jest.spyOn(DummyLogWriter, "GetId").mockReturnValue("test");
    const spyOnLogError = jest.spyOn(DummyLogWriter, "LogError");
    mockAxios.post.mockRejectedValue(error);
    await expect(client.postTaxClearanceCertificate(userData)).rejects.toEqual(StatusCodes.BAD_REQUEST);

    expect(spyOnLogError.mock.calls[0]).toEqual([
      "Tax Clearance Certificate Client - Id:test - Error",
      error,
    ]);

    spyOnGetId.mockRestore();
    spyOnLogError.mockRestore();
  });

  it("throws error when error response is unknown", async () => {
    const userData = generateUserData({});
    mockAxios.post.mockRejectedValue({
      response: { status: StatusCodes.INTERNAL_SERVER_ERROR },
    });
    await expect(client.postTaxClearanceCertificate(userData)).rejects.toEqual(
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  });

  it("returns INELIGIBLE_TAX_CLEARANCE_FORM error", async () => {
    const userData = generateUserData({});
    mockAxios.post.mockRejectedValue({
      response: { status: StatusCodes.BAD_REQUEST, data: INELIGIBLE_TAX_CLEARANCE_FORM },
    });
    expect(await client.postTaxClearanceCertificate(userData)).toEqual({
      error: {
        message: INELIGIBLE_TAX_CLEARANCE_FORM,
        type: "INELIGIBLE_TAX_CLEARANCE_FORM",
      },
    });
  });

  it("returns FAILED_TAX_ID_AND_PIN_VALIDATION error", async () => {
    const userData = generateUserData({});
    mockAxios.post.mockRejectedValue({
      response: { status: StatusCodes.BAD_REQUEST, data: FAILED_TAX_ID_AND_PIN_VALIDATION },
    });
    expect(await client.postTaxClearanceCertificate(userData)).toEqual({
      error: {
        message: FAILED_TAX_ID_AND_PIN_VALIDATION,
        type: "FAILED_TAX_ID_AND_PIN_VALIDATION",
      },
    });
  });

  it("returns SYSTEM_ERROR error", async () => {
    const userData = generateUserData({});
    mockAxios.post.mockRejectedValue({
      response: { status: StatusCodes.BAD_REQUEST, data: SYSTEM_ERROR },
    });
    expect(await client.postTaxClearanceCertificate(userData)).toEqual({
      error: {
        message: SYSTEM_ERROR,
        type: "SYSTEM_ERROR",
      },
    });
  });

  it("returns MISSING_FIELD error", async () => {
    const userData = generateUserData({});
    mockAxios.post.mockRejectedValue({
      response: { status: StatusCodes.BAD_REQUEST, data: MISSING_FIELD },
    });
    expect(await client.postTaxClearanceCertificate(userData)).toEqual({
      error: {
        message: MISSING_FIELD,
        type: "MISSING_FIELD",
      },
    });
  });

  it("returns TAX_ID_MISSING_FIELD error", async () => {
    const userData = generateUserData({});
    mockAxios.post.mockRejectedValue({
      response: { status: StatusCodes.BAD_REQUEST, data: TAX_ID_MISSING_FIELD },
    });
    expect(await client.postTaxClearanceCertificate(userData)).toEqual({
      error: {
        message: TAX_ID_MISSING_FIELD,
        type: "MISSING_FIELD",
      },
    });
  });

  it("returns TAX_ID_MISSING_FIELD_WITH_EXTRA_SPACE error", async () => {
    const userData = generateUserData({});
    mockAxios.post.mockRejectedValue({
      response: { status: StatusCodes.BAD_REQUEST, data: TAX_ID_MISSING_FIELD_WITH_EXTRA_SPACE },
    });
    expect(await client.postTaxClearanceCertificate(userData)).toEqual({
      error: {
        message: TAX_ID_MISSING_FIELD_WITH_EXTRA_SPACE,
        type: "MISSING_FIELD",
      },
    });
  });
});
