import { ApiTaxClearanceCertificateClient } from "@client/ApiTaxClearanceCertificateClient";
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
    const userData = generateUserData({
      currentBusinessId: "123",
      user: generateUser({
        id: "user-id1",
        name: "user-name1",
      }),
      businesses: {
        123: generateBusiness({
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            requestingAgencyId: "newJerseyBoardOfPublicUtilities",
            businessName: "my business name",
            addressLine1: "123 main st",
            addressLine2: "apt 1",
            addressCity: "atlanta",
            addressState: { shortCode: "AK", name: "Alaska" },
            addressZipCode: "12345",
            taxId: "123456789101",
            taxPin: "1234",
          }),
        }),
      },
    });

    client.postTaxClearanceCertificate(userData);
    expect(mockAxios.post).toHaveBeenCalledWith(
      "www.test.com//TYTR_ACE_App/ProcessCertificate/businessClearance",
      {
        repId: "user-id1",
        repName: "user-name1",
        taxpayerId: "123456789101",
        taxpayerPin: "1234",
        taxpayerName: "my business name",
        addressLine1: "123 main st",
        addressLine2: "apt 1",
        city: "atlanta",
        state: "AK",
        zip: "12345",
        agencyName: LookupTaxClearanceCertificateAgenciesById("newJerseyBoardOfPublicUtilities").name,
      },
      {
        auth: { password: "fakePassword", username: "fakeUserName" },
      }
    );
  });

  it("should spy on GetId, return a value and invoke LogInfo", () => {
    const spyOnGetId = jest.spyOn(DummyLogWriter, "GetId").mockReturnValue("test");
    const spyOnLogInfo = jest.spyOn(DummyLogWriter, "LogInfo");
    client.postTaxClearanceCertificate(userData);
    expect(spyOnGetId).toHaveBeenCalled();
    expect(spyOnLogInfo).toHaveBeenCalledWith("Tax Clearance Certificate Client - Id:test");
    spyOnGetId.mockRestore();
    spyOnLogInfo.mockRestore();
  });

  it("logs post request to LogInfo", async () => {
    const spyOnGetId = jest.spyOn(DummyLogWriter, "GetId").mockReturnValue("test");

    const userData = generateUserData({
      currentBusinessId: "123",
      user: generateUser({
        id: "user-id1",
        name: "user-name1",
      }),
      businesses: {
        123: generateBusiness({
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            requestingAgencyId: "newJerseyBoardOfPublicUtilities",
            businessName: "my business name",
            addressLine1: "123 main st",
            addressLine2: "apt 1",
            addressCity: "atlanta",
            addressState: { shortCode: "AK", name: "Alaska" },
            addressZipCode: "12345",
            taxId: "123456789101",
            taxPin: "1234",
          }),
        }),
      },
    });

    const currTaxClearanceData = userData.businesses[userData.currentBusinessId].taxClearanceCertificateData;
    const postBody = {
      repId: userData.user.id,
      repName: userData.user.name,
      taxpayerId: currTaxClearanceData.taxId,
      taxpayerPin: currTaxClearanceData.taxPin,
      taxpayerName: currTaxClearanceData.businessName,
      addressLine1: currTaxClearanceData.addressLine1,
      addressLine2: currTaxClearanceData.addressLine2,
      city: currTaxClearanceData.addressCity,
      state: currTaxClearanceData.addressState?.shortCode,
      zip: currTaxClearanceData.addressZipCode,
      agencyName: LookupTaxClearanceCertificateAgenciesById(currTaxClearanceData.requestingAgencyId).name,
    };

    const spyOnLogInfo = jest.spyOn(DummyLogWriter, "LogInfo");
    await client.postTaxClearanceCertificate(userData);

    expect(spyOnLogInfo.mock.calls[1][0]).toEqual(
      `Tax Clearance Certificate Client - Id:test - Request Sent to ${
        config.orgUrl
      }//TYTR_ACE_App/ProcessCertificate/businessClearance data: ${JSON.stringify(postBody)}`
    );

    spyOnGetId.mockRestore();
    spyOnLogInfo.mockRestore();
  });

  it("logs api response to LogInfo", async () => {
    const spyOnGetId = jest.spyOn(DummyLogWriter, "GetId").mockReturnValue("test");
    const spyOnLogInfo = jest.spyOn(DummyLogWriter, "LogInfo");
    mockAxios.post.mockResolvedValue({ data: { certificate: [11, 22] } });
    await client.postTaxClearanceCertificate(userData);

    expect(spyOnLogInfo.mock.calls[2][0]).toEqual(
      `Tax Clearance Certificate Client - Id:test - Response received: ${JSON.stringify({
        certificate: [11, 22],
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
});
