import { ApiBusinessNameClient, ApiNameAvailabilityResponse } from "@client/ApiBusinessNameClient";
import { BusinessNameClient } from "@domain/types";
import { DummyLogWriter, LogWriter, LogWriterType } from "@libs/logWriter";
import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;
const DEBUG = Boolean(process.env.DEBUG ?? false);

describe("ApiBusinessNameClient", () => {
  let client: BusinessNameClient;
  let logger: LogWriterType;

  beforeEach(() => {
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");
    client = ApiBusinessNameClient("www.example.com", DEBUG ? logger : DummyLogWriter);
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

  it("returns a designator reason in the response", async () => {
    const mockResponse: ApiNameAvailabilityResponse = {
      Available: false,
      Reason: "contains business designators",
      Similars: [],
    };
    mockAxios.get.mockResolvedValue({ data: mockResponse });
    expect(await client.search("name")).toEqual({
      status: "DESIGNATOR_ERROR",
      similarNames: [],
    });
    expect(mockAxios.get).toHaveBeenCalledWith("www.example.com/Available?q=name");
  });

  it("returns a restricted reason in the response", async () => {
    const mockResponse: ApiNameAvailabilityResponse = {
      Available: false,
      Reason: "contains the restricted word 'thingy' whatevers",
      Similars: [],
    };
    mockAxios.get.mockResolvedValue({ data: mockResponse });
    expect(await client.search("name")).toEqual({
      status: "RESTRICTED_ERROR",
      invalidWord: "thingy",
      similarNames: [],
    });
    expect(mockAxios.get).toHaveBeenCalledWith("www.example.com/Available?q=name");
  });

  it("returns a special character reason in the response", async () => {
    const mockResponse: ApiNameAvailabilityResponse = {
      Available: false,
      Reason: "contains invalid special character",
      Similars: [],
    };
    mockAxios.get.mockResolvedValue({ data: mockResponse });
    expect(await client.search("name")).toEqual({
      status: "SPECIAL_CHARACTER_ERROR",
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

  it("url-encodes the query", async () => {
    mockAxios.get.mockResolvedValue({ data: { Available: false, Reason: "", Similars: [] } });
    await client.search("some#name");
    expect(mockAxios.get).toHaveBeenCalledWith("www.example.com/Available?q=some%23name");
  });
});
