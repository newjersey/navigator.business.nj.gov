import axios from "axios";
import { AccessTokenClient } from "../domain/types";
import { LogWriter, LogWriterType } from "../libs/logWriter";
import { DynamicsAccessTokenClient } from "./DynamicsAccessTokenClient";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("DynamicsAccessTokenClient", () => {
  let client: AccessTokenClient;
  let logger: LogWriterType;

  let ORIGINAL_ORG_URL: string | undefined;
  const ORG_URL = "www.test-org-url.com";

  let ORIGINAL_TENANT_ID: string | undefined;
  const TENANT_ID = "test-tenant-id-123";

  let ORIGINAL_APPLICATION_ID: string | undefined;
  const APPLICATION_ID = "test-application-id-123";

  let ORIGINAL_CLIENT_SECRET: string | undefined;
  const CLIENT_SECRET = "test-client-secret-123";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");
    client = DynamicsAccessTokenClient(logger);

    ORIGINAL_ORG_URL = process.env.DCA_DYNAMICS_ORG_URL;
    process.env.DCA_DYNAMICS_ORG_URL = ORG_URL;

    ORIGINAL_TENANT_ID = process.env.DCA_DYNAMICS_TENENT_ID;
    process.env.DCA_DYNAMICS_TENENT_ID = TENANT_ID;

    ORIGINAL_APPLICATION_ID = process.env.DCA_DYNAMICS_CLIENT_ID;
    process.env.DCA_DYNAMICS_CLIENT_ID = APPLICATION_ID;

    ORIGINAL_CLIENT_SECRET = process.env.DCA_DYNAMICS_SECRET;
    process.env.DCA_DYNAMICS_SECRET = CLIENT_SECRET;
  });

  afterEach(() => {
    process.env.DCA_DYNAMICS_ORG_URL = ORIGINAL_ORG_URL;
    process.env.DCA_DYNAMICS_TENENT_ID = ORIGINAL_TENANT_ID;
    process.env.DCA_DYNAMICS_CLIENT_ID = ORIGINAL_APPLICATION_ID;
    process.env.DCA_DYNAMICS_SECRET = ORIGINAL_CLIENT_SECRET;
  });

  it("queries the dca dynamics access token endpoint with a body", async () => {
    const accessTokenMockResponse = {
      token_type: "Bearer",
      expires_in: "3599",
      ext_expires_in: "3599",
      expires_on: "1692118180",
      not_before: "1692114280",
      resource: ORG_URL,
      access_token: "test-access-token",
    };

    mockAxios.post.mockResolvedValue({ data: accessTokenMockResponse });
    expect(await client.getAccessToken()).toEqual(accessTokenMockResponse.access_token);
    expect(mockAxios.post).toHaveBeenCalledWith(`https://login.windows.net/${TENANT_ID}/oauth2/token`, {
      grant_type: "client_credentials",
      resource: ORG_URL,
      client_id: APPLICATION_ID,
      client_secret: CLIENT_SECRET,
    });
  });

  it("returns empty string if data is empty", async () => {
    mockAxios.post.mockResolvedValue({ data: {} });
    expect(await client.getAccessToken()).toEqual("");
  });
});
