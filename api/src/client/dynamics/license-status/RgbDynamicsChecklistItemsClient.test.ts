/* eslint-disable unicorn/no-null */
import { RgbDynamicsChecklistItemsClient } from "@client/dynamics/license-status/RgbDynamicsChecklistItemsClient";
import {
  ChecklistItemsForAllApplicationsClient,
  LicenseApplicationIdResponse,
} from "@client/dynamics/license-status/rgbDynamicsLicenseStatusTypes";
import { LogWriter, LogWriterType } from "@libs/logWriter";
import { generateLicenseApplicationIdResponseValue } from "@test/factories";
import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("RgbDynamicsChecklistItemsClient", () => {
  let client: ChecklistItemsForAllApplicationsClient;
  let logger: LogWriterType;

  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");

    client = RgbDynamicsChecklistItemsClient(logger, ORG_URL);
  });

  const mockAccessToken = "access-granted";
  const mockApplicationIdResponse: LicenseApplicationIdResponse[] = [
    generateLicenseApplicationIdResponseValue({}),
  ];

  it("makes a get request to RGB API with the checklist items query and auth token in the header", async () => {
    mockAxios.get.mockResolvedValue({ data: { value: [] } });
    await client.getChecklistItemsForAllApplications(mockAccessToken, mockApplicationIdResponse);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/rgb_checklistitems?$select=activitytypecode,rgb_categorycode,statecode,subject,statuscode&$filter=(_regardingobjectid_value eq ${mockApplicationIdResponse[0].applicationId})`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("makes multiple get requests to RGB API with the checklist items query and auth token in the header", async () => {
    const mockApplicationIdResponse: LicenseApplicationIdResponse[] = [
      generateLicenseApplicationIdResponseValue({}),
      generateLicenseApplicationIdResponseValue({}),
    ];
    mockAxios.get.mockResolvedValue({ data: { value: [] } });
    await client.getChecklistItemsForAllApplications(mockAccessToken, mockApplicationIdResponse);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/rgb_checklistitems?$select=activitytypecode,rgb_categorycode,statecode,subject,statuscode&$filter=(_regardingobjectid_value eq ${mockApplicationIdResponse[0].applicationId})`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/rgb_checklistitems?$select=activitytypecode,rgb_categorycode,statecode,subject,statuscode&$filter=(_regardingobjectid_value eq ${mockApplicationIdResponse[1].applicationId})`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("makes multiple requests and returns one response with checklist data and one without checklist data", async () => {
    const licenseApplicationIdResponse1 = generateLicenseApplicationIdResponseValue({});
    const licenseApplicationIdResponse2 = generateLicenseApplicationIdResponseValue({});

    const mockApplicationIdResponse: LicenseApplicationIdResponse[] = [
      licenseApplicationIdResponse1,
      licenseApplicationIdResponse2,
    ];

    const mockChecklistItemsResponse = [
      {
        activitytypecode: "rgb_checklistitem",
        rgb_categorycode: 100000000,
        statecode: 0,
        subject: "Business Forms - Cert of Inc, Formation, Trade Names",
        statuscode: 1,
        activityid: "69aead2d-9fff-ed11-8847-001dd803435d",
      },
      {
        activitytypecode: "rgb_checklistitem",
        rgb_categorycode: 100000000,
        statecode: 0,
        subject: "Registration Fee",
        statuscode: 2,
        activityid: "fec7d939-9fff-ed11-8847-001dd803435d",
      },
    ];

    mockAxios.get.mockResolvedValueOnce({ data: { value: mockChecklistItemsResponse } });
    mockAxios.get.mockResolvedValueOnce({ data: { value: [] } });

    expect(
      await client.getChecklistItemsForAllApplications(mockAccessToken, mockApplicationIdResponse)
    ).toEqual([
      {
        licenseStatus: licenseApplicationIdResponse1.licenseStatus,
        professionNameAndLicenseType: licenseApplicationIdResponse1.professionNameAndLicenseType,
        expirationDateISO: licenseApplicationIdResponse1.expirationDateISO,
        checklistItems: [
          {
            title: "Business Forms - Cert of Inc, Formation, Trade Names",
            status: "PENDING",
          },
          {
            title: "Registration Fee",
            status: "ACTIVE",
          },
        ],
      },
      {
        licenseStatus: licenseApplicationIdResponse2.licenseStatus,
        professionNameAndLicenseType: licenseApplicationIdResponse2.professionNameAndLicenseType,
        expirationDateISO: licenseApplicationIdResponse2.expirationDateISO,
        checklistItems: [],
      },
    ]);
  });

  it("throws status error when api call fails", async () => {
    mockAxios.get.mockRejectedValue({
      response: { status: 500 },
    });

    await expect(
      client.getChecklistItemsForAllApplications(mockAccessToken, mockApplicationIdResponse)
    ).rejects.toEqual(500);
  });
});
