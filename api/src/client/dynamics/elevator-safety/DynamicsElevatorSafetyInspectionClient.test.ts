import { DynamicsElevatorSafetyInspectionClient } from "@client/dynamics/elevator-safety/DynamicsElevatorSafetyInspectionClient";
import { ElevatorSafetyInspectionClient } from "@client/dynamics/elevator-safety/types";
import { DummyLogWriter, LogWriter, LogWriterType } from "@libs/logWriter";
import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;
const DEBUG = Boolean(process.env.DEBUG ?? false);

describe("DynamicsElevatorSafetyInspectionClient", () => {
  let client: ElevatorSafetyInspectionClient;
  let logger: LogWriterType;

  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");

    client = DynamicsElevatorSafetyInspectionClient(DEBUG ? logger : DummyLogWriter, ORG_URL);
  });

  const mockAccessToken = "access-granted";
  const searchAddress = "address-1";

  it("makes a successful get request and returns inspection data", async () => {
    const elevatorSafetyInspectionMockResponse = {
      value: [
        {
          createdon: "2023-05-31T10:31:51Z",
          statecode: 0,
          ultra_buildingstreetaddress: searchAddress,
          ultra_devicecount: 2,
        },
        {
          createdon: "2023-06-31T10:31:51Z",
          statecode: 1,
          ultra_buildingstreetaddress: searchAddress,
          ultra_devicecount: 1,
        },
      ],
    };

    mockAxios.get.mockResolvedValue({ data: elevatorSafetyInspectionMockResponse });
    expect(await client.getElevatorInspections(mockAccessToken, searchAddress)).toEqual([
      {
        date: "2023-05-31T10:31:51Z",
        address: searchAddress,
        stateCode: 0,
        deviceCount: 2,
      },
      {
        date: "2023-06-31T10:31:51Z",
        address: searchAddress,
        stateCode: 1,
        deviceCount: 1,
      },
    ]);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_elsainspections?$select=createdon,statecode,ultra_devicecount,ultra_buildingstreetaddress&$filter=(ultra_buildingstreetaddress eq '${searchAddress}')&$top=10`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("returns an empty array if no matching addresses are found", async () => {
    const elevatorSafetyMockResponse = {
      value: [],
    };

    mockAxios.get.mockResolvedValue({ data: elevatorSafetyMockResponse });
    expect(await client.getElevatorInspections(mockAccessToken, searchAddress)).toEqual([]);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_elsainspections?$select=createdon,statecode,ultra_devicecount,ultra_buildingstreetaddress&$filter=(ultra_buildingstreetaddress eq '${searchAddress}')&$top=10`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });
});
