import { RgbBusinessIdsAndNamesClient } from "@client/dynamics/license-status/RgbBusinessIdsAndNamesClient";
import { BusinessIdsAndNamesClient } from "@client/dynamics/license-status/rgbLicenseStatusTypes";
import { NO_ADDRESS_MATCH_ERROR } from "@domain/types";
import { LogWriter, LogWriterType } from "@libs/logWriter";
import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("RgbBusinessIdsClient", () => {
  let client: BusinessIdsAndNamesClient;
  let logger: LogWriterType;

  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");

    client = RgbBusinessIdsAndNamesClient(logger, ORG_URL);
  });

  const mockAccessToken = "access-granted";
  const mockNametoSearch = "Barcade";

  const mockBusinessName1 = "Barcade123456";
  const mockBusinessId1 = "123456";

  const mockBusinessName2 = "Barcade789102";
  const mockBusinessId2 = "789102";

  it("makes a get request to dynamics api with the business ids query and auth token in header", async () => {
    const businessIdMockResponse = {
      value: [
        {
          name: mockBusinessName1,
          accountid: mockBusinessId1,
        },
        {
          name: mockBusinessName2,
          accountid: mockBusinessId2,
        },
      ],
    };

    mockAxios.get.mockResolvedValue({ data: businessIdMockResponse });
    expect(await client.getMatchedBusinessIdsAndNames(mockAccessToken, mockNametoSearch)).toEqual([
      {
        name: mockBusinessName1,
        businessId: mockBusinessId1,
      },
      {
        name: mockBusinessName2,
        businessId: mockBusinessId2,
      },
    ]);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/accounts?$select=name,accountid&$filter=(contains(name, '${mockNametoSearch}'))`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("rejects with NO_MATCH error when received data value is an empty array", async () => {
    mockAxios.get.mockResolvedValue({ data: { value: [] } });
    const expectedThrownError = client.getMatchedBusinessIdsAndNames(mockAccessToken, mockNametoSearch);
    await expect(expectedThrownError).rejects.toEqual(new Error(NO_ADDRESS_MATCH_ERROR));
  });

  it("throws status error when api call fails", async () => {
    mockAxios.get.mockRejectedValue({
      response: { status: 500 },
    });

    await expect(client.getMatchedBusinessIdsAndNames(mockAccessToken, mockNametoSearch)).rejects.toEqual(
      500
    );
  });
});
