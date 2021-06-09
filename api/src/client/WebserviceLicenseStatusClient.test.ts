import axios from "axios";
import { generateLicenseEntity } from "../domain/factories";
import { LicenseStatusClient } from "../domain/types";
import { WebserviceLicenseStatusClient } from "./WebserviceLicenseStatusClient";

jest.mock("axios");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("WebserviceLicenseStatusClient", () => {
  let client: LicenseStatusClient;

  beforeEach(() => {
    client = WebserviceLicenseStatusClient("www.example.com");
    jest.resetAllMocks();
  });

  it("queries to the webservice endpoint with passed data", async () => {
    const entities = [generateLicenseEntity({})];
    mockAxios.post.mockResolvedValue({ data: entities });
    expect(await client.search("some-name", "12345", "some-license-type")).toEqual(entities);
    expect(mockAxios.post).toHaveBeenCalledWith("www.example.com/ws/getLicenseStatus", {
      zipCode: "12345",
      businessName: "some-name",
      licenseType: "some-license-type",
    });
  });
});
