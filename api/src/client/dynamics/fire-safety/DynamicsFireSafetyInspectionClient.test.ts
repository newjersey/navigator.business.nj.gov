/* eslint-disable unicorn/no-null */
import { LogWriter, LogWriterType } from "@libs/logWriter";
import { generateLicenseSearchAddress } from "@shared/test";
import axios from "axios";
import { DynamicsFireSafetyInspectionClient } from "@client/dynamics/fire-safety/DynamicsFireSafetyInspectionClient";
import { FireSafetyInspectionClient } from "@client/dynamics/fire-safety/types";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("DynamicsFireSafetyInspectionClient", () => {
  let client: FireSafetyInspectionClient;
  let logger: LogWriterType;

  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");

    client = DynamicsFireSafetyInspectionClient(logger, ORG_URL);
  });

  const mockAccessToken = "access-granted";
  const searchAdress = "address-1"


  it("makes a succesful get request and returns inspection data", async () => {
    const fireSafetyInspectionMockResponse = {
      value: [
        {
          createdon: "2023-05-31T10:31:51Z",
          ultra_inspectionended: true,
          ultra_numberofopenviolations: 0,
          ultra_streetaddress: searchAdress
        },
        {
          createdon: "2023-06-31T10:31:51Z",
          ultra_inspectionended: false,
          ultra_numberofopenviolations: 5,
          ultra_streetaddress: searchAdress
        },
      ],
    };

    mockAxios.get.mockResolvedValue({ data: fireSafetyInspectionMockResponse });
    expect(await client.getFireSafetyInspectionsByAddress(mockAccessToken, searchAdress)).toEqual([
      {
        createdOn: "2023-05-31T10:31:51Z",
        inspectionFinished: true,
        address: searchAdress,
        openViolationCount: 0
      },
      {
        createdOn: "2023-06-31T10:31:51Z",
        inspectionFinished: false,
        address: searchAdress,
        openViolationCount: 5
      },
    ]);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/rgb_addresses?$select=createdon,ultra_inspectionended,ultra_numberofopenviolations,ultra_streetaddress&$filter=(ultra_streetaddress eq ${searchAdress})&$top=10`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );

  });

  it("returns an empty array if no matching addresses are found", async () => {
    const fireSafetyInspectionMockResponse = {
      value: [],
    };

    mockAxios.get.mockResolvedValue({ data: fireSafetyInspectionMockResponse });
    expect(await client.getFireSafetyInspectionsByAddress(mockAccessToken, searchAdress)).toEqual([]);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/rgb_addresses?$select=createdon,ultra_inspectionended,ultra_numberofopenviolations,ultra_streetaddress&$filter=(ultra_streetaddress eq ${searchAdress})&$top=10`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });
});
