import { DynamicsBusinessIdsClient } from "@client/dynamics/license-status/DynamicsBusinessIdsClient";
import { BusinessIdClient } from "@client/dynamics/license-status/types";
import { NO_MATCH_ERROR } from "@domain/types";
import { LogWriter, LogWriterType } from "@libs/logWriter";
import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("DynamicsBusinessIdsClient", () => {
  let client: BusinessIdClient;
  let logger: LogWriterType;

  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");

    client = DynamicsBusinessIdsClient(logger, ORG_URL);
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
    expect(await client.getMatchedBusinessIds(mockAccessToken, mockNametoSearch)).toEqual([
      mockBusinessId1,
      mockBusinessId2,
    ]);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/accounts?$select=name,accountid&$filter=(contains(name, '${mockNametoSearch}'))&$top=50`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("rejects with NO_MATCH error when received data value is an empty array", async () => {
    mockAxios.get.mockResolvedValue({ data: { value: [] } });
    const expectedThrownError = client.getMatchedBusinessIds(mockAccessToken, mockNametoSearch);
    await expect(expectedThrownError).rejects.toEqual(new Error(NO_MATCH_ERROR));
  });
});
