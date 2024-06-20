/* eslint-disable unicorn/no-null */
import { DynamicsLicenseApplicationIdClient } from "@client/dynamics/license-status/DynamicsLicenseApplicationIdClient";
import { LicenseApplicationIdClient } from "@client/dynamics/license-status/types";
import { NO_MAIN_APPS_ERROR } from "@domain/types";
import { LogWriter, LogWriterType } from "@libs/logWriter";
import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("DynamicsLicenseApplicationIdClient", () => {
  let client: LicenseApplicationIdClient;
  let logger: LogWriterType;

  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");
    client = DynamicsLicenseApplicationIdClient(logger, ORG_URL);
  });

  const mockBusinessId = "123456";
  const mockAccessToken = "access-granted";
  const publicMoversAndWarehousemenLicenseTypeId = "19391a3f-53df-eb11-bacb-001dd8028561";

  it("makes a get request to dynamics api with the license application id query and auth token in header", async () => {
    const mockLicenseApplicationIdResponse = {
      value: [
        {
          rgb_appnumber: "MLI00030602",
          rgb_number: "39PM00105300",
          rgb_startdate: "2023-06-07T11:49:24Z",
          rgb_versioncode: 100000000,
          rgb_expirationdate: "2023-09-30T00:00:00Z",
          statecode: 0,
          statuscode: 100000006,
          rgb_applicationid: "7b5c178c-2805-ee11-a81c-001dd805ef6c",
          _rgb_businessid_value: "6182f96b-2105-ee11-a81c-001dd805ef6c",
        },
        {
          rgb_appnumber: "WLI00030610",
          rgb_number: "39PW00105401",
          rgb_startdate: "2023-06-08T04:44:34Z",
          rgb_versioncode: 100000000,
          rgb_expirationdate: "2023-09-30T00:00:00Z",
          statecode: 0,
          statuscode: 100000006,
          rgb_applicationid: "8b7bbfb9-b605-ee11-a81c-001dd80648b3",
          _rgb_businessid_value: "6182f96b-2105-ee11-a81c-001dd805ef6c",
        },
        {
          rgb_appnumber: "MLI00030615",
          rgb_number: "39PM00105502",
          rgb_startdate: "2023-06-08T04:52:25Z",
          rgb_versioncode: 100000000,
          rgb_expirationdate: "2023-09-30T00:00:00Z",
          statecode: 0,
          statuscode: 100000006,
          rgb_applicationid: "1abb2efc-b705-ee11-a81c-001dd80648b3",
          _rgb_businessid_value: "6182f96b-2105-ee11-a81c-001dd805ef6c",
        },
      ],
    };

    mockAxios.get.mockResolvedValue({ data: mockLicenseApplicationIdResponse });
    expect(
      await client.getLicenseApplicationId(mockAccessToken, mockBusinessId, "Public Movers and Warehousemen")
    ).toEqual({
      expirationDate: "2023-09-30T00:00:00Z",
      applicationId: "7b5c178c-2805-ee11-a81c-001dd805ef6c",
      licenseStatus: "ACTIVE",
    });
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/rgb_applications?$select=rgb_appnumber,rgb_number,rgb_startdate,rgb_versioncode,rgb_expirationdate,statecode,statuscode,rgb_applicationid&$filter=(_rgb_businessid_value eq ${mockBusinessId} and _rgb_apptypeid_value eq ${publicMoversAndWarehousemenLicenseTypeId})&$top=50`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("filters out applications whose statecode is not 0", async () => {
    const mockLicenseApplicationIdResponse = {
      value: [
        {
          rgb_appnumber: "INACTIVE1234",
          rgb_number: "39PW00105401",
          rgb_startdate: null,
          rgb_versioncode: 100000000,
          rgb_expirationdate: null,
          statecode: 1,
          statuscode: 100000005,
          rgb_applicationid: "license-id-1357",
        },
        {
          rgb_appnumber: "TELI00030500",
          rgb_number: "39PW00105400",
          rgb_startdate: null,
          rgb_versioncode: 100000000,
          rgb_expirationdate: null,
          statecode: 0,
          statuscode: 100000005,
          rgb_applicationid: "license-id-1357",
        },
      ],
    };

    mockAxios.get.mockResolvedValue({ data: mockLicenseApplicationIdResponse });
    expect(
      await client.getLicenseApplicationId(mockAccessToken, mockBusinessId, "Public Movers and Warehousemen")
    ).toEqual({
      expirationDate: "",
      applicationId: "license-id-1357",
      licenseStatus: "APPROVED",
    });
  });

  it("filters out applications whose rgb_number doesn't end with 00", async () => {
    const mockLicenseApplicationIdResponse = {
      value: [
        {
          rgb_appnumber: "WLI00030610",
          rgb_number: "39PW00105401",
          rgb_startdate: "2023-06-08T04:44:34Z",
          rgb_versioncode: 100000000,
          rgb_expirationdate: "2023-09-30T00:00:00Z",
          statecode: 0,
          statuscode: 100000006,
          rgb_applicationid: "8b7bbfb9-b605-ee11-a81c-001dd80648b3",
          _rgb_businessid_value: "6182f96b-2105-ee11-a81c-001dd805ef6c",
        },
        {
          rgb_appnumber: "MLI00030615",
          rgb_number: "39PM00105502",
          rgb_startdate: "2023-06-08T04:52:25Z",
          rgb_versioncode: 100000000,
          rgb_expirationdate: "2023-09-30T00:00:00Z",
          statecode: 0,
          statuscode: 100000006,
          rgb_applicationid: "1abb2efc-b705-ee11-a81c-001dd80648b3",
          _rgb_businessid_value: "6182f96b-2105-ee11-a81c-001dd805ef6c",
        },
        {
          rgb_appnumber: "MLI00030602",
          rgb_number: "39PM00105300",
          rgb_startdate: "2023-06-07T11:49:24Z",
          rgb_versioncode: 100000000,
          rgb_expirationdate: "2023-09-30T00:00:00Z",
          statecode: 0,
          statuscode: 100000006,
          rgb_applicationid: "7b5c178c-2805-ee11-a81c-001dd805ef6c",
          _rgb_businessid_value: "6182f96b-2105-ee11-a81c-001dd805ef6c",
        },
      ],
    };

    mockAxios.get.mockResolvedValue({ data: mockLicenseApplicationIdResponse });
    expect(
      await client.getLicenseApplicationId(mockAccessToken, mockBusinessId, "Public Movers and Warehousemen")
    ).toEqual({
      expirationDate: "2023-09-30T00:00:00Z",
      applicationId: "7b5c178c-2805-ee11-a81c-001dd805ef6c",
      licenseStatus: "ACTIVE",
    });
  });

  it("filters out applications whose rgb_number is null", async () => {
    const mockLicenseApplicationIdResponse = {
      value: [
        {
          rgb_appnumber: "MLI00001050",
          rgb_number: "39PM00100100",
          rgb_startdate: "2022-01-09T05:00:00Z",
          rgb_versioncode: 100000000,
          rgb_expirationdate: "2023-01-31T05:00:00Z",
          statecode: 0,
          statuscode: 100000007,
          rgb_applicationid: "299c88b0-7a90-ed11-aad1-001dd804fc82",
        },
        {
          rgb_appnumber: "MLI00001086",
          rgb_number: null,
          rgb_startdate: null,
          rgb_versioncode: 100000000,
          rgb_expirationdate: null,
          statecode: 0,
          statuscode: 100000000,
          rgb_applicationid: "c3e503d1-eb91-ed11-a81b-001dd806f556",
        },
      ],
    };

    mockAxios.get.mockResolvedValue({ data: mockLicenseApplicationIdResponse });
    expect(
      await client.getLicenseApplicationId(mockAccessToken, mockBusinessId, "Public Movers and Warehousemen")
    ).toEqual({
      expirationDate: "2023-01-31T05:00:00Z",
      applicationId: "299c88b0-7a90-ed11-aad1-001dd804fc82",
      licenseStatus: "PENDING_RENEWAL",
    });
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/rgb_applications?$select=rgb_appnumber,rgb_number,rgb_startdate,rgb_versioncode,rgb_expirationdate,statecode,statuscode,rgb_applicationid&$filter=(_rgb_businessid_value eq ${mockBusinessId} and _rgb_apptypeid_value eq ${publicMoversAndWarehousemenLicenseTypeId})&$top=50`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("throws NO_MAIN_APPS error when there are no matching apps whose rgb_number ends with 00", async () => {
    mockAxios.get.mockResolvedValue({
      data: {
        value: [
          {
            rgb_appnumber: "WLI00030610",
            rgb_number: "39PW00105401",
            rgb_startdate: "2023-06-08T04:44:34Z",
            rgb_versioncode: 100000000,
            rgb_expirationdate: "2023-09-30T00:00:00Z",
            statecode: 0,
            statuscode: 100000006,
            rgb_applicationid: "8b7bbfb9-b605-ee11-a81c-001dd80648b3",
            _rgb_businessid_value: "6182f96b-2105-ee11-a81c-001dd805ef6c",
          },
        ],
      },
    });
    await expect(
      client.getLicenseApplicationId(mockAccessToken, mockBusinessId, "Public Movers and Warehousemen")
    ).rejects.toEqual(new Error(NO_MAIN_APPS_ERROR));
  });

  it("returns the first application when there are multiple matching apps whose rgb_number ends with 00", async () => {
    const mockResponseWithMultipleMainApplications = {
      value: [
        {
          rgb_appnumber: "WLI00030610",
          rgb_number: "39PW00105401",
          rgb_startdate: "2023-06-08T04:44:34Z",
          rgb_versioncode: 100000000,
          rgb_expirationdate: "2023-09-30T00:00:00Z",
          statecode: 0,
          statuscode: 100000006,
          rgb_applicationid: "8b7bbfb9-b605-ee11-a81c-001dd80648b3",
          _rgb_businessid_value: "6182f96b-2105-ee11-a81c-001dd805ef6c",
        },
        {
          rgb_appnumber: "MLI00030615",
          rgb_number: "39PM00105500",
          rgb_startdate: "2023-06-08T04:52:25Z",
          rgb_versioncode: 100000000,
          rgb_expirationdate: "2023-09-30T00:00:00Z",
          statecode: 0,
          statuscode: 100000006,
          rgb_applicationid: "1abb2efc-b705-ee11-a81c-001dd80648b3",
          _rgb_businessid_value: "6182f96b-2105-ee11-a81c-001dd805ef6c",
        },
        {
          rgb_appnumber: "MLI00030602",
          rgb_number: "39PM00105300",
          rgb_startdate: "2023-06-07T11:49:24Z",
          rgb_versioncode: 100000000,
          rgb_expirationdate: "2023-09-30T00:00:00Z",
          statecode: 0,
          statuscode: 100000006,
          rgb_applicationid: "7b5c178c-2805-ee11-a81c-001dd805ef6c",
          _rgb_businessid_value: "6182f96b-2105-ee11-a81c-001dd805ef6c",
        },
      ],
    };

    const expected = {
      applicationId: "1abb2efc-b705-ee11-a81c-001dd80648b3",
      expirationDate: "2023-09-30T00:00:00Z",
      licenseStatus: "ACTIVE",
    };

    mockAxios.get.mockResolvedValue({ data: mockResponseWithMultipleMainApplications });
    expect(
      await client.getLicenseApplicationId(mockAccessToken, mockBusinessId, "Public Movers and Warehousemen")
    ).toEqual(expected);
  });
});
