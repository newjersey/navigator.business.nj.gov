import { DynamicsHousingHealthCheckClient } from "@client/dynamics/housing/DynamicsHousingHealthCheckClient";
import { AccessTokenClient } from "@client/dynamics/types";
import { HealthCheckMethod } from "@domain/types";
import { DummyLogWriter, LogWriter, LogWriterType } from "@libs/logWriter";
import axios from "axios";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;
const DEBUG = Boolean(process.env.DEBUG ?? false);

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
    client = DynamicsHousingHealthCheckClient(DEBUG ? logger : DummyLogWriter, {
      accessTokenClient: stubAccessTokenClient,
      orgUrl: ORG_URL,
    });
  });

  it("returns a passing health check if data can be retrieved sucessfully", async () => {
    mockAxios.get.mockResolvedValue({});
    expect(await client()).toEqual({ success: true, data: { message: "OK" } });
  });

  it("returns a failing health check if unexpected data is retrieved", async () => {
    mockAxios.get.mockRejectedValue({ response: { status: StatusCodes.NOT_FOUND }, message: "" });
    expect(await client()).toEqual({
      success: false,
      error: {
        message: ReasonPhrases.BAD_GATEWAY,
        serverResponseBody: "",
        serverResponseCode: StatusCodes.NOT_FOUND,
        timeout: false,
      },
    });
  });

  it("returns a failing health check if axios request times out", async () => {
    mockAxios.get.mockRejectedValue({});
    expect(await client()).toEqual({
      success: false,
      error: {
        message: ReasonPhrases.GATEWAY_TIMEOUT,
        timeout: true,
      },
    });
  });
});
