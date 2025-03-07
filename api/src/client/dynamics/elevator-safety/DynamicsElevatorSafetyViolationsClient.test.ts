import { DynamicsElevatorSafetyViolationsClient } from "@client/dynamics/elevator-safety/DynamicsElevatorSafetyViolationsClient";
import { ElevatorSafetyViolationsClient } from "@client/dynamics/elevator-safety/types";
import { DummyLogWriter, LogWriter, LogWriterType } from "@libs/logWriter";
import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;
const DEBUG = Boolean(process.env.DEBUG ?? false);

describe("DynamicsElevatorSafetyViolationClient", () => {
  let client: ElevatorSafetyViolationsClient;
  let logger: LogWriterType;

  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");

    client = DynamicsElevatorSafetyViolationsClient(DEBUG ? logger : DummyLogWriter, ORG_URL);
  });

  const mockAccessToken = "access-granted";

  it("returns true if violations found for address", async () => {
    const buildingResponse = [
      {
        _ultra_propertyinterest_value: "123",
        ultra_buildingid: "456",
      },
    ];

    const deviceIdsResponse = [
      {
        _ultra_building_value: "456",
        ultra_elsadeviceinspectionid: "abc",
      },
    ];

    const violationsResponse = [
      {
        statusCode: 1,
        ultra_citationdate: "01/01/2020",
      },
    ];

    const address = "address-1";
    const municipalityId = "municipality-id-1";

    mockAxios.get.mockResolvedValueOnce({ data: { value: buildingResponse } });
    mockAxios.get.mockResolvedValueOnce({ data: { value: deviceIdsResponse } });
    mockAxios.get.mockResolvedValueOnce({ data: { value: violationsResponse } });
    expect(await client.getViolationsForPropertyInterest(mockAccessToken, address, municipalityId)).toEqual(
      true
    );

    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_buildings?$select=ultra_buildingid&$filter=(ultra_name eq '${address}' and _ultra_municipality_value eq '${municipalityId}')`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );

    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_elsadeviceinspections?$filter=(_ultra_building_value eq '456')`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );

    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_elsacitations?$filter=(_ultra_deviceinspection_value eq abc)`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("returns false if no buildings found for address", async () => {
    const address = "address-1";
    const municipalityId = "municipality-id-1";

    mockAxios.get.mockResolvedValueOnce({ data: { value: [] } });

    expect(await client.getViolationsForPropertyInterest(mockAccessToken, address, municipalityId)).toEqual(
      false
    );

    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_buildings?$select=ultra_buildingid&$filter=(ultra_name eq '${address}' and _ultra_municipality_value eq '${municipalityId}')`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("returns false if no device inspections are found", async () => {
    const buildingResponse = [
      {
        _ultra_propertyinterest_value: "123",
        ultra_buildingid: "456",
      },
    ];

    const address = "address-1";
    const municipalityId = "municipality-id-1";

    mockAxios.get.mockResolvedValueOnce({ data: { value: buildingResponse } });
    mockAxios.get.mockResolvedValueOnce({ data: { value: [] } });
    expect(await client.getViolationsForPropertyInterest(mockAccessToken, address, municipalityId)).toEqual(
      false
    );

    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_buildings?$select=ultra_buildingid&$filter=(ultra_name eq '${address}' and _ultra_municipality_value eq '${municipalityId}')`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );

    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_elsadeviceinspections?$filter=(_ultra_building_value eq '456')`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("returns false if no violations are found for address", async () => {
    const buildingResponse = [
      {
        _ultra_propertyinterest_value: "123",
        ultra_buildingid: "456",
      },
    ];

    const deviceIdsResponse = [
      {
        _ultra_building_value: "456",
        ultra_elsadeviceinspectionid: "abc",
      },
    ];

    const address = "address-1";
    const municipalityId = "municipality-id-1";

    mockAxios.get.mockResolvedValueOnce({ data: { value: buildingResponse } });
    mockAxios.get.mockResolvedValueOnce({ data: { value: deviceIdsResponse } });
    mockAxios.get.mockResolvedValueOnce({ data: { value: [] } });
    expect(await client.getViolationsForPropertyInterest(mockAccessToken, address, municipalityId)).toEqual(
      false
    );

    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_buildings?$select=ultra_buildingid&$filter=(ultra_name eq '${address}' and _ultra_municipality_value eq '${municipalityId}')`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );

    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_elsadeviceinspections?$filter=(_ultra_building_value eq '456')`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );

    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_elsacitations?$filter=(_ultra_deviceinspection_value eq abc)`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("returns true if violations found in second building", async () => {
    const buildingResponse = [
      {
        _ultra_propertyinterest_value: "123",
        ultra_buildingid: "456",
      },
      {
        _ultra_propertyinterest_value: "999",
        ultra_buildingid: "000",
      },
    ];

    const deviceIdsResponse = [
      {
        _ultra_building_value: "456",
        ultra_elsadeviceinspectionid: "abc",
      },
    ];

    const violationsResponse = [
      {
        statusCode: 1,
        ultra_citationdate: "01/01/2020",
      },
    ];

    const address = "address-1";
    const municipalityId = "municipality-id-1";

    mockAxios.get.mockResolvedValueOnce({ data: { value: buildingResponse } });
    mockAxios.get.mockResolvedValueOnce({ data: { value: [] } });
    mockAxios.get.mockResolvedValueOnce({ data: { value: deviceIdsResponse } });
    mockAxios.get.mockResolvedValueOnce({ data: { value: violationsResponse } });
    expect(await client.getViolationsForPropertyInterest(mockAccessToken, address, municipalityId)).toEqual(
      true
    );

    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_buildings?$select=ultra_buildingid&$filter=(ultra_name eq '${address}' and _ultra_municipality_value eq '${municipalityId}')`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );

    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_elsadeviceinspections?$filter=(_ultra_building_value eq '456')`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );

    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_elsadeviceinspections?$filter=(_ultra_building_value eq '000')`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );

    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_elsacitations?$filter=(_ultra_deviceinspection_value eq abc)`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });
});
