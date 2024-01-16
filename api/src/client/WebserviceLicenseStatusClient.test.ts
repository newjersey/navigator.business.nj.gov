import { WebserviceLicenseStatusClient } from "@client/WebserviceLicenseStatusClient";
import { LicenseStatusClient } from "@domain/types";
import { LogWriter, LogWriterType } from "@libs/logWriter";
import { generateLicenseEntity } from "@test/factories";
import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("WebserviceLicenseStatusClient", () => {
  let client: LicenseStatusClient;
  let logger: LogWriterType;

  beforeEach(() => {
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");
    client = WebserviceLicenseStatusClient("www.example.com", logger);
    jest.resetAllMocks();
  });

  it("queries to the webservice endpoint with passed data", async () => {
    const entities = [generateLicenseEntity({})];
    mockAxios.post.mockResolvedValue({ data: entities });
    expect(await client.search("some-name", "12345", "some-license-type")).toEqual(entities);
    expect(mockAxios.post).toHaveBeenCalledWith("www.example.com/ws/simple/queryLicenseStatus", {
      zipCode: "12345",
      businessName: "some-name",
      licenseType: "some-license-type",
    });
  });

  it("returns empty list if data is empty", async () => {
    mockAxios.post.mockResolvedValue({ data: "" });
    expect(await client.search("name", "11111", "some-type")).toEqual([]);
  });

  it("returns a passing health check if data can be retrieved sucessfully", async () => {
    mockAxios.post.mockResolvedValue({});
    expect(await client.health()).toEqual({ success: true, data: { message: "OK" } });
  });

  it("returns a failing health check if unexpected data is retrieved", async () => {
    mockAxios.post.mockRejectedValue({ response: { status: 404 }, message: "" });
    expect(await client.health()).toEqual({
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
    mockAxios.post.mockRejectedValue({});
    expect(await client.health()).toEqual({
      success: false,
      error: {
        message: "Gateway Timeout",
        timeout: true,
      },
    });
  });
});
