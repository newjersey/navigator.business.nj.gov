import { DynamicsAccessTokenClient } from "@client/dynamics/DynamicsAccessTokenClient";
import { AccessTokenClient } from "@client/dynamics/types";
import { LogWriter, LogWriterType } from "@libs/logWriter";
import axios from "axios";

jest.mock("winston");
jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("DynamicsAccessTokenClient", () => {
  let client: AccessTokenClient;
  let logger: LogWriterType;

  const ORG_URL = "www.test-org-url.com";
  const TENANT_ID = "test-tenant-id-123";
  const CLIENT_ID = "test-client-id-123";
  const CLIENT_SECRET = "test-client-secret-123";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");

    client = DynamicsAccessTokenClient(logger, {
      tenantId: TENANT_ID,
      orgUrl: ORG_URL,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
    });
  });

  it("postForms to dynamics access token endpoint with a body", async () => {
    const accessTokenMockResponse = {
      token_type: "Bearer",
      expires_in: "3599",
      ext_expires_in: "3599",
      expires_on: "1692118180",
      not_before: "1692114280",
      resource: ORG_URL,
      access_token: "test-access-token",
    };

    mockAxios.postForm.mockResolvedValue({ data: accessTokenMockResponse });
    expect(await client.getAccessToken()).toEqual(accessTokenMockResponse.access_token);
    expect(mockAxios.postForm).toHaveBeenCalledWith(`https://login.windows.net/${TENANT_ID}/oauth2/token`, {
      grant_type: "client_credentials",
      resource: ORG_URL,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });
  });

  it("returns empty string if received data is empty", async () => {
    mockAxios.postForm.mockResolvedValue({ data: {} });
    expect(await client.getAccessToken()).toEqual("");
  });
});
