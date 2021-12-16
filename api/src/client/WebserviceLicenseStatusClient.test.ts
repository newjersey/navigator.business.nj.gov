import axios from "axios";
import { generateLicenseEntity } from "../../test/factories";
import { LicenseStatusClient } from "../domain/types";
import { LogWriter, LogWriterType } from "../libs/logWriter";
import { WebserviceLicenseStatusClient } from "./WebserviceLicenseStatusClient";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("WebserviceLicenseStatusClient", () => {
  let client: LicenseStatusClient;
  let logger: LogWriterType;

  beforeEach(() => {
    logger = LogWriter("NavigatorWebService", "SearchApis", "us-test-1");
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
});
