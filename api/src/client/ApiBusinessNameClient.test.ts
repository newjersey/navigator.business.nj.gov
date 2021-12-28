import axios from "axios";
import { BusinessNameClient } from "../domain/types";
import { LogWriter, LogWriterType } from "../libs/logWriter";
import { ApiBusinessNameClient, ApiNameAvailabilityResponse } from "./ApiBusinessNameClient";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("ApiBusinessNameClient", () => {
  let client: BusinessNameClient;
  let logger: LogWriterType;

  beforeEach(() => {
    logger = LogWriter("NavigatorWebService", "SearchApis", "us-test-1");
    client = ApiBusinessNameClient("www.example.com", logger);
    jest.resetAllMocks();
  });

  it("returns an available response", async () => {
    const mockResponse: ApiNameAvailabilityResponse = {
      Available: true,
      Reason: "some reason",
      Similars: [],
    };
    mockAxios.get.mockResolvedValue({ data: mockResponse });
    expect(await client.search("name")).toEqual({
      status: "AVAILABLE",
      similarNames: [],
    });
    expect(mockAxios.get).toHaveBeenCalledWith("www.example.com/Available?q=name");
  });

  it("returns a non-available response", async () => {
    const mockResponse: ApiNameAvailabilityResponse = {
      Available: false,
      Reason: "some reason",
      Similars: ["name 1", "name 2"],
    };
    mockAxios.get.mockResolvedValue({ data: mockResponse });
    expect(await client.search("name")).toEqual({
      status: "UNAVAILABLE",
      similarNames: ["name 1", "name 2"],
    });
    expect(mockAxios.get).toHaveBeenCalledWith("www.example.com/Available?q=name");
  });
});
