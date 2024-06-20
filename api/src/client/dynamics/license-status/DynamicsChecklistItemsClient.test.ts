/* eslint-disable unicorn/no-null */
import { DynamicsChecklistItemsClient } from "@client/dynamics/license-status/DynamicsChecklistItemsClient";
import { ChecklistItemsClient } from "@client/dynamics/license-status/types";
import { LogWriter, LogWriterType } from "@libs/logWriter";
import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("DynamicsChecklistItemsClient", () => {
  let client: ChecklistItemsClient;
  let logger: LogWriterType;

  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");

    client = DynamicsChecklistItemsClient(logger, ORG_URL);
  });

  const mocklicenseApplicationId = "123456";
  const mockAccessToken = "access-granted";

  it("makes a get request to dynamics api with the checklist items query and auth token in the header", async () => {
    const mockChecklistItemsResponse = {
      value: [
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
      ],
    };

    mockAxios.get.mockResolvedValue({ data: mockChecklistItemsResponse });
    expect(await client.getChecklistItems(mockAccessToken, mocklicenseApplicationId)).toEqual([
      {
        title: "Business Forms - Cert of Inc, Formation, Trade Names",
        status: "PENDING",
      },
      {
        title: "Registration Fee",
        status: "ACTIVE",
      },
    ]);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/rgb_checklistitems?$select=activitytypecode,rgb_categorycode,statecode,subject,statuscode&$filter=(_regardingobjectid_value eq ${mocklicenseApplicationId})&$top=50`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("returns empty array if received data value is empty", async () => {
    mockAxios.get.mockResolvedValue({ data: { value: [] } });
    expect(await client.getChecklistItems(mockAccessToken, mocklicenseApplicationId)).toEqual([]);
  });
});
