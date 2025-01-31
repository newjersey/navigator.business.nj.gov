/* eslint-disable unicorn/no-null */
import {
  appTypeKeysString,
  licenseAppType,
  RegulatedBusinessDynamicsLicenseApplicationIdsClient,
} from "@client/dynamics/license-status/RegulatedBusinessDynamicsLicenseApplicationIdsClient";
import {
  BusinessIdAndName,
  LicenseApplicationIdsForAllBusinessIdsClient,
} from "@client/dynamics/license-status/regulatedBusinessDynamicsLicenseStatusTypes";
import { NO_MATCH_ERROR } from "@domain/types";
import { DummyLogWriter, LogWriter, LogWriterType } from "@libs/logWriter";
import { generateLicenseApplicationIdApiResponseValue } from "@test/factories";
import { RGB_APP_TYPE_KEYS, RGB_LICENSE_APPLICATION_INFORMATION } from "@test/helpers";
import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

const DEBUG = Boolean(process.env.DEBUG ?? false);

const HEALTH_CLUB_LICENSE_UUID = "af8e3564-53df-eb11-bacb-001dd8028561";
const PUBLIC_MOVERS_LICENSE_UUID = "19391a3f-53df-eb11-bacb-001dd8028561";

describe("RegulatedBusinessDynamicsLicenseApplicationIdClient", () => {
  let client: LicenseApplicationIdsForAllBusinessIdsClient;
  let logger: LogWriterType;

  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");
    client = RegulatedBusinessDynamicsLicenseApplicationIdsClient(DEBUG ? logger : DummyLogWriter, ORG_URL);
  });

  const mockBusinessNameAndId_1: BusinessIdAndName = {
    name: "Example Business",
    businessId: "1234567890",
  };
  const mockBusinessNameAndId_2: BusinessIdAndName = {
    name: "Example Business",
    businessId: "0987654321",
  };
  const mockAccessToken = "access-granted";

  describe("core functionality", () => {
    it("makes a single get request to dynamics api with the license application id query and auth token in header", async () => {
      const mockLicenseApplicationIdResponse = {
        value: [
          generateLicenseApplicationIdApiResponseValue({
            rgb_name: "Example Business-Public Movers",
            rgb_number: "123400",
          }),
        ],
      };

      mockAxios.get.mockResolvedValue({ data: mockLicenseApplicationIdResponse });
      await client.getLicenseApplicationIdsForAllBusinessIds(mockAccessToken, [mockBusinessNameAndId_1]);
      expect(mockAxios.get).toHaveBeenCalledWith(
        `${ORG_URL}/api/data/v9.2/rgb_applications?$select=${appTypeKeysString},_rgb_apptypeid_value,rgb_name,rgb_appnumber,rgb_number,rgb_startdate,rgb_versioncode,rgb_expirationdate,statecode,statuscode,rgb_applicationid&$filter=(_rgb_businessid_value eq ${mockBusinessNameAndId_1.businessId})`,
        {
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
          },
        }
      );
    });

    it("makes multiple get requests to dynamics api with the license application id query and auth token in header", async () => {
      const application_1 = generateLicenseApplicationIdApiResponseValue({
        rgb_name: "Example Business-Public Movers",
        rgb_number: "123400",
      });

      const application_2 = generateLicenseApplicationIdApiResponseValue({
        rgb_name: "Example Business-Cosmetology",
        rgb_number: "123400",
      });

      mockAxios.get
        .mockResolvedValueOnce({
          data: {
            value: [application_1],
          },
        })
        .mockResolvedValueOnce({
          data: {
            value: [application_2],
          },
        });
      await client.getLicenseApplicationIdsForAllBusinessIds(mockAccessToken, [
        mockBusinessNameAndId_1,
        mockBusinessNameAndId_2,
      ]);

      expect(mockAxios.get).toHaveBeenCalledTimes(2);
      expect(mockAxios.get).toHaveBeenCalledWith(
        `${ORG_URL}/api/data/v9.2/rgb_applications?$select=${appTypeKeysString},_rgb_apptypeid_value,rgb_name,rgb_appnumber,rgb_number,rgb_startdate,rgb_versioncode,rgb_expirationdate,statecode,statuscode,rgb_applicationid&$filter=(_rgb_businessid_value eq ${mockBusinessNameAndId_1.businessId})`,
        {
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
          },
        }
      );
      expect(mockAxios.get).toHaveBeenCalledWith(
        `${ORG_URL}/api/data/v9.2/rgb_applications?$select=${appTypeKeysString},_rgb_apptypeid_value,rgb_name,rgb_appnumber,rgb_number,rgb_startdate,rgb_versioncode,rgb_expirationdate,statecode,statuscode,rgb_applicationid&$filter=(_rgb_businessid_value eq ${mockBusinessNameAndId_2.businessId})`,
        {
          headers: {
            Authorization: `Bearer ${mockAccessToken}`,
          },
        }
      );
    });

    it("filters out applications whose statecode is not 0", async () => {
      const application_1 = generateLicenseApplicationIdApiResponseValue({
        statecode: 1,
        statuscode: 100000005,
        rgb_number: "123400",
        _rgb_apptypeid_value: HEALTH_CLUB_LICENSE_UUID,
      });
      const application_2 = generateLicenseApplicationIdApiResponseValue({
        statecode: 0,
        statuscode: 100000005,
        rgb_number: "123400",
        _rgb_apptypeid_value: HEALTH_CLUB_LICENSE_UUID,
      });

      const mockLicenseApplicationIdResponse = {
        value: [application_1, application_2],
      };

      mockAxios.get.mockResolvedValue({ data: mockLicenseApplicationIdResponse });
      expect(
        await client.getLicenseApplicationIdsForAllBusinessIds(mockAccessToken, [mockBusinessNameAndId_1])
      ).toEqual([
        {
          expirationDateISO: application_2.rgb_expirationdate,
          applicationId: application_2.rgb_applicationid,
          licenseStatus: "APPROVED",
          professionNameAndLicenseType: "Health Club Services",
        },
      ]);
    });

    it("filters out Public Movers applications whose rgb_number doesn't end with 00", async () => {
      const application_1 = generateLicenseApplicationIdApiResponseValue({
        rgb_number: "39PM00105500",
        rgb_versioncode: 100000000,
        statecode: 0,
        statuscode: 100000006,
        rgb_name: "Example Business 2-profession 2",
        _rgb_apptypeid_value: PUBLIC_MOVERS_LICENSE_UUID,
        rgb_publicmoverscode: 100000000,
      });
      const application_2 = generateLicenseApplicationIdApiResponseValue({
        rgb_number: "39PM00105502",
        rgb_versioncode: 100000000,
        statecode: 0,
        statuscode: 100000006,
        rgb_name: "Example Business 2-profession 2",
        _rgb_apptypeid_value: PUBLIC_MOVERS_LICENSE_UUID,
        rgb_publicmoverscode: 100000000,
      });
      const application_3 = generateLicenseApplicationIdApiResponseValue({
        rgb_number: "39PW00105401",
        rgb_versioncode: 100000000,
        statecode: 0,
        statuscode: 100000006,
        rgb_name: "Example Business 1-profession 1",
        _rgb_apptypeid_value: HEALTH_CLUB_LICENSE_UUID,
      });
      const application_4 = generateLicenseApplicationIdApiResponseValue({
        rgb_number: "39PM00105300",
        rgb_versioncode: 100000000,
        statecode: 0,
        statuscode: 100000006,
        rgb_name: "Example Business 3-profession 3",
        _rgb_apptypeid_value: HEALTH_CLUB_LICENSE_UUID,
      });

      const mockLicenseApplicationIdResponse = {
        value: [application_1, application_2, application_3, application_4],
      };

      mockAxios.get.mockResolvedValue({ data: mockLicenseApplicationIdResponse });
      expect(
        await client.getLicenseApplicationIdsForAllBusinessIds(mockAccessToken, [mockBusinessNameAndId_1])
      ).toEqual([
        {
          expirationDateISO: application_1.rgb_expirationdate,
          applicationId: application_1.rgb_applicationid,
          licenseStatus: "ACTIVE",
          professionNameAndLicenseType: "Public Movers and Warehousemen-Moving Only",
        },
        {
          expirationDateISO: application_3.rgb_expirationdate,
          applicationId: application_3.rgb_applicationid,
          licenseStatus: "ACTIVE",
          professionNameAndLicenseType: "Health Club Services",
        },
        {
          expirationDateISO: application_4.rgb_expirationdate,
          applicationId: application_4.rgb_applicationid,
          licenseStatus: "ACTIVE",
          professionNameAndLicenseType: "Health Club Services",
        },
      ]);
    });

    it("returns multiple Public Movers applications when multiple applications end with 00", async () => {
      const application_1 = generateLicenseApplicationIdApiResponseValue({
        rgb_number: "39PM00105500",
        rgb_versioncode: 100000000,
        statecode: 0,
        statuscode: 100000006,
        rgb_name: "Example Business 2-profession 2",
        _rgb_apptypeid_value: PUBLIC_MOVERS_LICENSE_UUID,
        rgb_publicmoverscode: 100000000,
      });
      const application_2 = generateLicenseApplicationIdApiResponseValue({
        rgb_number: "39PM00105500",
        rgb_versioncode: 100000000,
        statecode: 0,
        statuscode: 100000006,
        rgb_name: "Example Business 2-profession 2",
        _rgb_apptypeid_value: PUBLIC_MOVERS_LICENSE_UUID,
        rgb_publicmoverscode: 100000001,
      });

      const mockLicenseApplicationIdResponse = {
        value: [application_1, application_2],
      };

      mockAxios.get.mockResolvedValue({ data: mockLicenseApplicationIdResponse });
      expect(
        await client.getLicenseApplicationIdsForAllBusinessIds(mockAccessToken, [mockBusinessNameAndId_1])
      ).toEqual([
        {
          expirationDateISO: application_1.rgb_expirationdate,
          applicationId: application_1.rgb_applicationid,
          licenseStatus: "ACTIVE",
          professionNameAndLicenseType: "Public Movers and Warehousemen-Moving Only",
        },
        {
          expirationDateISO: application_2.rgb_expirationdate,
          applicationId: application_2.rgb_applicationid,
          licenseStatus: "ACTIVE",
          professionNameAndLicenseType: "Public Movers and Warehousemen-Warehousing Only",
        },
      ]);
    });

    it("filters out applications whose rgb_number is null", async () => {
      const application_1 = generateLicenseApplicationIdApiResponseValue({
        rgb_name: "Example Business 1-profession 1",
        rgb_number: "39PM00100100",
        rgb_versioncode: 100000000,
        statecode: 0,
        statuscode: 100000007,
        _rgb_apptypeid_value: HEALTH_CLUB_LICENSE_UUID,
      });
      const application_2 = generateLicenseApplicationIdApiResponseValue({
        rgb_name: "Example Business 2-profession 2",
        rgb_number: null,
        rgb_startdate: null,
        rgb_versioncode: 100000000,
        rgb_expirationdate: null,
        statecode: 0,
        statuscode: 100000000,
        _rgb_apptypeid_value: HEALTH_CLUB_LICENSE_UUID,
      });

      const mockLicenseApplicationIdResponse = {
        value: [application_1, application_2],
      };

      mockAxios.get.mockResolvedValue({ data: mockLicenseApplicationIdResponse });
      expect(
        await client.getLicenseApplicationIdsForAllBusinessIds(mockAccessToken, [mockBusinessNameAndId_1])
      ).toEqual([
        {
          expirationDateISO: application_1.rgb_expirationdate,
          applicationId: application_1.rgb_applicationid,
          licenseStatus: "PENDING_RENEWAL",
          professionNameAndLicenseType: "Health Club Services",
        },
      ]);
    });

    it("throws NO_MATCH error when there are no matching applications", async () => {
      const application_1 = generateLicenseApplicationIdApiResponseValue({
        rgb_versioncode: 100000000,
        statecode: 1,
        statuscode: 100000006,
        rgb_name: "Example Business 1-profession 1",
        _rgb_apptypeid_value: HEALTH_CLUB_LICENSE_UUID,
      });

      mockAxios.get.mockResolvedValue({
        data: {
          value: [application_1],
        },
      });
      await expect(
        client.getLicenseApplicationIdsForAllBusinessIds(mockAccessToken, [mockBusinessNameAndId_1])
      ).rejects.toEqual(new Error(NO_MATCH_ERROR));
    });

    it("makes a single request and returns all matching license application ids", async () => {
      const application_1 = generateLicenseApplicationIdApiResponseValue({
        rgb_name: "Example Business-Public Movers",
        rgb_number: "39PM00105300",
        rgb_versioncode: 100000000,
        statecode: 0,
        statuscode: 100000006,
        _rgb_apptypeid_value: HEALTH_CLUB_LICENSE_UUID,
      });
      const application_2 = generateLicenseApplicationIdApiResponseValue({
        rgb_name: "Example Business-Cosmetology",
        rgb_number: "39PW00105401",
        rgb_versioncode: 100000000,
        statecode: 0,
        statuscode: 100000006,
        _rgb_apptypeid_value: HEALTH_CLUB_LICENSE_UUID,
      });

      const mockLicenseApplicationIdResponse = {
        value: [application_1, application_2],
      };

      mockAxios.get.mockResolvedValue({ data: mockLicenseApplicationIdResponse });
      expect(
        await client.getLicenseApplicationIdsForAllBusinessIds(mockAccessToken, [mockBusinessNameAndId_1])
      ).toEqual([
        {
          expirationDateISO: application_1.rgb_expirationdate,
          applicationId: application_1.rgb_applicationid,
          licenseStatus: "ACTIVE",
          professionNameAndLicenseType: "Health Club Services",
        },
        {
          expirationDateISO: application_2.rgb_expirationdate,
          applicationId: application_2.rgb_applicationid,
          licenseStatus: "ACTIVE",
          professionNameAndLicenseType: "Health Club Services",
        },
      ]);
      expect(mockAxios.get).toHaveBeenCalledTimes(1);
    });

    it("makes multiple get requests and returns all matching license application ids", async () => {
      const application_1 = generateLicenseApplicationIdApiResponseValue({
        rgb_name: "Example Business-Public Movers",
        rgb_number: "123400",
        statuscode: 100000006,
        _rgb_apptypeid_value: HEALTH_CLUB_LICENSE_UUID,
      });

      const application_2 = generateLicenseApplicationIdApiResponseValue({
        rgb_name: "Example Business-Cosmetology",
        rgb_number: "123400",
        statuscode: 100000006,
        _rgb_apptypeid_value: HEALTH_CLUB_LICENSE_UUID,
      });

      mockAxios.get
        .mockResolvedValueOnce({
          data: {
            value: [application_1],
          },
        })
        .mockResolvedValueOnce({
          data: {
            value: [application_2],
          },
        });

      expect(
        await client.getLicenseApplicationIdsForAllBusinessIds(mockAccessToken, [
          mockBusinessNameAndId_1,
          mockBusinessNameAndId_2,
        ])
      ).toEqual([
        {
          applicationId: application_1.rgb_applicationid,
          expirationDateISO: application_1.rgb_expirationdate,
          licenseStatus: "ACTIVE",
          professionNameAndLicenseType: "Health Club Services",
        },
        {
          applicationId: application_2.rgb_applicationid,
          expirationDateISO: application_2.rgb_expirationdate,
          licenseStatus: "ACTIVE",
          professionNameAndLicenseType: "Health Club Services",
        },
      ]);
      expect(mockAxios.get).toHaveBeenCalledTimes(2);
    });

    it("throws status error when api call fails", async () => {
      mockAxios.get.mockRejectedValue({
        response: { status: 500 },
      });

      await expect(
        client.getLicenseApplicationIdsForAllBusinessIds(mockAccessToken, [mockBusinessNameAndId_1])
      ).rejects.toEqual(500);
    });
  });

  describe("licenseAppType", () => {
    it("validates LICENSE_APPLICATION_INFORMATION contains all supported licenses", () => {
      expect(RGB_LICENSE_APPLICATION_INFORMATION.length).toBe(Object.keys(licenseAppType).length);
      for (const application of RGB_LICENSE_APPLICATION_INFORMATION) {
        const licenseAppTypeKey = application.appTypeCode
          ? `${application.uuid}-${application.appTypeCode}`
          : application.uuid;
        expect(licenseAppType[licenseAppTypeKey]).toBe(application.expectedProfession);
      }
    });

    it.each(RGB_LICENSE_APPLICATION_INFORMATION)(
      "returns object whose professionNameAndLicenseType key is $expectedProfession",
      async ({ appTypeCode, expectedProfession, uuid }) => {
        const mockLicenseApplicationIdResponse = {
          value: [
            generateLicenseApplicationIdApiResponseValue({
              rgb_number: "39PM00105300",
              rgb_versioncode: 100000000,
              statecode: 0,
              statuscode: 100000006,
              [RGB_APP_TYPE_KEYS[uuid]]: appTypeCode,
              _rgb_apptypeid_value: uuid,
            }),
          ],
        };

        mockAxios.get.mockResolvedValue({ data: mockLicenseApplicationIdResponse });

        const repsonse = await client.getLicenseApplicationIdsForAllBusinessIds(mockAccessToken, [
          mockBusinessNameAndId_1,
        ]);
        expect(repsonse[0].professionNameAndLicenseType).toEqual(expectedProfession);
      }
    );
  });
});
