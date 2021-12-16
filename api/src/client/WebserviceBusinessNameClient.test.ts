import axios from "axios";
import { BusinessNameClient } from "../domain/types";
import { LogWriter, LogWriterType } from "../libs/logWriter";
import { WebserviceBusinessNameClient } from "./WebserviceBusinessNameClient";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("WebserviceBusinessNameClient", () => {
  let client: BusinessNameClient;
  let logger: LogWriterType;

  beforeEach(() => {
    logger = LogWriter("NavigatorWebService", "SearchApis", "us-test-1");
    client = WebserviceBusinessNameClient("www.example.com", logger);
    jest.resetAllMocks();
  });

  it("queries to the webservice endpoint with passed data", async () => {
    const returnedNames = ["name1", "name2"];
    mockAxios.post.mockResolvedValue({ data: returnedNames });
    expect(await client.search("name")).toEqual(returnedNames);
    expect(mockAxios.post).toHaveBeenCalledWith("www.example.com/ws/simple/queryBusinessName", {
      businessName: "name",
    });
  });

  it("returns empty list if data is empty", async () => {
    mockAxios.post.mockResolvedValue({ data: "" });
    expect(await client.search("name")).toEqual([]);
  });
});
