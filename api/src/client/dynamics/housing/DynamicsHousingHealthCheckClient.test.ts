import { DynamicsHousingHealthCheckClient } from "@client/dynamics/housing/DynamicsHousingHealthCheckClient";
import { AccessTokenClient } from "@client/dynamics/types";
import { HealthCheckMethod } from "@domain/types";
import { LogWriter, LogWriterType } from "@libs/logWriter";
import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("DynamicsHousingHealthCheckClient", () => {
  let client: HealthCheckMethod;
  let logger: LogWriterType;
  let stubAccessTokenClient: jest.Mocked<AccessTokenClient>;

  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");
    stubAccessTokenClient = {
      getAccessToken: jest.fn(),
    };
    client = DynamicsHousingHealthCheckClient(logger, {
      accessTokenClient: stubAccessTokenClient,
      orgUrl: ORG_URL,
    });
  });

  it("returns a passing health check if data can be retrieved sucessfully", async () => {
    mockAxios.get.mockResolvedValue({});
    expect(await client()).toEqual({ success: true, data: { message: "OK" } });
  });

  it("returns a failing health check if unexpected data is retrieved", async () => {
    mockAxios.get.mockRejectedValue({ response: { status: 404 }, message: "" });
    expect(await client()).toEqual({
      success: false,
      error: {
        message: "Bad Gateway",
        serverResponseBody: "",
        serverResponseCode: 404,
        timeout: false,
      },
    });
  });

  it("returns a failing health check if axios request times out", async () => {
    mockAxios.get.mockRejectedValue({});
    expect(await client()).toEqual({
      success: false,
      error: {
        message: "Gateway Timeout",
        timeout: true,
      },
    });
  });
});
