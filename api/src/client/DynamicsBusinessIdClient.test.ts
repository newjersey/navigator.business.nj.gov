import axios from "axios";
import { BusinessIdClient } from "../domain/types";
import { LogWriter, LogWriterType } from "../libs/logWriter";
import { DynamicsBusinessIdClient } from "./DynamicsBusinessIdClient";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("DynamicsBusinessIdClient", () => {
  let client: BusinessIdClient;
  let logger: LogWriterType;

  let ORIGINAL_ORG_URL: string | undefined;
  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");
    client = DynamicsBusinessIdClient(logger);

    ORIGINAL_ORG_URL = process.env.DCA_DYNAMICS_ORG_URL;
    process.env.DCA_DYNAMICS_ORG_URL = ORG_URL;
  });

  afterEach(() => {
    process.env.DCA_DYNAMICS_ORG_URL = ORIGINAL_ORG_URL;
  });

  const mockBusinessId = "123456";
  const mockNametoSearch = "Barcade";
  const mockAccessToken = "access-granted";

  it("queries the dca dynamics business id endpoint with auth token in header", async () => {
    const businessIdMockResponse = {
      value: [
        {
          name: mockNametoSearch,
          accountid: mockBusinessId,
        },
      ],
    };

    mockAxios.get.mockResolvedValue({ data: { ...businessIdMockResponse } });
    expect(await client.getBusinessId(mockAccessToken, mockNametoSearch)).toEqual(
      businessIdMockResponse.value[0].accountid
    );
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/accounts?$select=name,accountid&$filter=(contains(name, '${mockNametoSearch}'))&$top=50`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("returns empty string if data is empty", async () => {
    mockAxios.get.mockResolvedValue({ data: {} });
    expect(await client.getBusinessId(mockAccessToken, mockNametoSearch)).toEqual("");
  });
});
