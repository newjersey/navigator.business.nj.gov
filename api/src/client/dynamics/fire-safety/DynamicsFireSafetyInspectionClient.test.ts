import { DynamicsFireSafetyInspectionClient } from "@client/dynamics/fire-safety/DynamicsFireSafetyInspectionClient";
import { FireSafetyInspectionClient } from "@client/dynamics/fire-safety/types";
import { DummyLogWriter, LogWriter, LogWriterType } from "@libs/logWriter";
import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;
const DEBUG = Boolean(process.env.DEBUG ?? false);

describe("DynamicsFireSafetyInspectionClient", () => {
  let client: FireSafetyInspectionClient;
  let logger: LogWriterType;

  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");

    client = DynamicsFireSafetyInspectionClient(DEBUG ? logger : DummyLogWriter, ORG_URL);
  });

  const mockAccessToken = "access-granted";
  const searchAddress = "address-1";

  it("makes a successful get request and returns inspection data", async () => {
    const fireSafetyInspectionMockResponse = {
      value: [
        {
          createdon: "2023-05-31T10:31:51Z",
          ultra_inspectionended: true,
          ultra_numberofopenviolations: 0,
          ultra_streetaddress: searchAddress,
        },
        {
          createdon: "2023-06-31T10:31:51Z",
          ultra_inspectionended: false,
          ultra_numberofopenviolations: 5,
          ultra_streetaddress: searchAddress,
        },
      ],
    };

    mockAxios.get.mockResolvedValue({ data: fireSafetyInspectionMockResponse });
    expect(await client.getFireSafetyInspections(mockAccessToken, searchAddress)).toEqual([
      {
        createdOn: "2023-05-31T10:31:51Z",
        inspectionFinished: true,
        address: searchAddress,
        openViolationCount: 0,
      },
      {
        createdOn: "2023-06-31T10:31:51Z",
        inspectionFinished: false,
        address: searchAddress,
        openViolationCount: 5,
      },
    ]);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_fireinspections?$select=createdon,ultra_inspectionended,ultra_numberofopenviolations,ultra_streetaddress&$filter=(ultra_streetaddress eq '${searchAddress}')&$top=10`,
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
    expect(await client.getFireSafetyInspections(mockAccessToken, searchAddress)).toEqual([]);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_fireinspections?$select=createdon,ultra_inspectionended,ultra_numberofopenviolations,ultra_streetaddress&$filter=(ultra_streetaddress eq '${searchAddress}')&$top=10`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });
});
