import { WebserviceLicenseStatusClient } from "@client/WebserviceLicenseStatusClient";
import { LicenseStatusClient } from "@domain/types";
import { LogWriter, LogWriterType } from "@libs/logWriter";
import { generateLicenseEntity } from "@test/factories";
import axios from "axios";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

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

  describe("search", () => {
    it("queries to the webservice endpoint with passed data", async () => {
      const entities = [generateLicenseEntity({})];
      mockAxios.post.mockResolvedValue({ data: entities });
      expect(await client.search("some-name", "12345")).toEqual(entities);
      expect(mockAxios.post).toHaveBeenCalledWith("www.example.com/ws/simple/queryLicenseStatuses", {
        zipCode: "12345",
        businessName: "some-name",
      });
    });

    it("returns empty list if data is empty", async () => {
      mockAxios.post.mockResolvedValue({ data: "" });
      expect(await client.search("name", "11111")).toEqual([]);
    });
  });

  describe("health", () => {
    it("returns a passing health check if data can be retrieved sucessfully", async () => {
      mockAxios.post.mockResolvedValue({});
      expect(await client.health()).toEqual({ success: true, data: { message: ReasonPhrases.OK } });
    });

    it("returns a failing health check if unexpected data is retrieved", async () => {
      mockAxios.post.mockRejectedValue({ response: { status: StatusCodes.NOT_FOUND }, message: "" });
      expect(await client.health()).toEqual({
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
      mockAxios.post.mockRejectedValue({});
      expect(await client.health()).toEqual({
        success: false,
        error: {
          message: ReasonPhrases.GATEWAY_TIMEOUT,
          timeout: true,
        },
      });
    });
  });
});
