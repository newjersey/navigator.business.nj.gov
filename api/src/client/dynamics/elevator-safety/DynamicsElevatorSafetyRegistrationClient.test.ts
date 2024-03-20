import { DynamicsElevatorSafetyRegistrationClient } from "@client/dynamics/elevator-safety/DynamicsElevatorSafetyRegistrationClient";
import { ElevatorSafetyRegistrationClient } from "@client/dynamics/elevator-safety/types";
import { LogWriter, LogWriterType } from "@libs/logWriter";
import axios from "axios";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("DynamicsElevatorSafetyRegistrationClient", () => {
  let client: ElevatorSafetyRegistrationClient;
  let logger: LogWriterType;

  const ORG_URL = "www.test-org-url.com";

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");

    client = DynamicsElevatorSafetyRegistrationClient(logger, ORG_URL);
  });

  const mockAccessToken = "access-granted";
  const propertyInterestId = "property-interest-id";

  it("returns registration data on matching property interest", async () => {
    const elevatorSafetyRegistrationMockResponse = {
      value: [
        {
          ultra_buildingaddressline1: "address-1",
          _ultra_propertyinterest_value: propertyInterestId,
          ultra_requestdate: "2021-06-14T04:00:29Z",
          ultra_elevatorregistrationrequestid: "request-id-1",
          statuscode: "1",
        },
      ],
    };

    const elevatorDevicesMockResponse = { value: [{}, {}] };

    mockAxios.get.mockResolvedValueOnce({ data: elevatorSafetyRegistrationMockResponse });
    mockAxios.get.mockResolvedValueOnce({ data: elevatorDevicesMockResponse });
    expect(await client.getElevatorRegistrationsForBuilding(mockAccessToken, propertyInterestId)).toEqual([
      {
        dateStarted: "2021-06-14T04:00:29Z",
        deviceCount: 2,
        status: "IN REVIEW",
      },
    ]);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_elevatorregistrationrequests?$select=createdon,statecode,statuscode&$filter=(_ultra_propertyinterest_value eq 'property-interest-id')`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_elevatordeviceregistrationrequests?$filter=(_ultra_registrationrequestid_value eq request-id-1)`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("returns multiple registrations in different states", async () => {
    const elevatorSafetyRegistrationMockResponse = {
      value: [
        {
          ultra_buildingaddressline1: "address-1",
          _ultra_propertyinterest_value: propertyInterestId,
          ultra_requestdate: "2021-06-14T04:00:29Z",
          ultra_elevatorregistrationrequestid: "request-id-1",
          statuscode: "240000001",
        },
        {
          ultra_buildingaddressline1: "address-1",
          _ultra_propertyinterest_value: propertyInterestId,
          ultra_requestdate: "2023-06-14T04:00:29Z",
          ultra_elevatorregistrationrequestid: "request-id-2",
          statuscode: "240000002",
        },
      ],
    };

    const elevatorDevicesMockResponse1 = { value: [{}, {}] };
    const elevatorDevicesMockResponse2 = { value: [{}, {}, {}] };

    mockAxios.get.mockResolvedValueOnce({ data: elevatorSafetyRegistrationMockResponse });
    mockAxios.get.mockResolvedValueOnce({ data: elevatorDevicesMockResponse1 });
    mockAxios.get.mockResolvedValueOnce({ data: elevatorDevicesMockResponse2 });
    expect(await client.getElevatorRegistrationsForBuilding(mockAccessToken, propertyInterestId)).toEqual([
      {
        dateStarted: "2021-06-14T04:00:29Z",
        deviceCount: 2,
        status: "APPROVED",
      },

      {
        dateStarted: "2023-06-14T04:00:29Z",
        deviceCount: 3,
        status: "REJECTED",
      },
    ]);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_elevatorregistrationrequests?$select=createdon,statecode,statuscode&$filter=(_ultra_propertyinterest_value eq 'property-interest-id')`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_elevatordeviceregistrationrequests?$filter=(_ultra_registrationrequestid_value eq request-id-1)`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_elevatordeviceregistrationrequests?$filter=(_ultra_registrationrequestid_value eq request-id-2)`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });

  it("returns all status codes correctly", async () => {
    const elevatorSafetyRegistrationMockResponse = {
      value: [
        {
          ultra_buildingaddressline1: "address-1",
          _ultra_propertyinterest_value: propertyInterestId,
          ultra_requestdate: "2021-06-14T04:00:29Z",
          ultra_elevatorregistrationrequestid: "request-id-1",
          statuscode: "1",
        },
        {
          ultra_buildingaddressline1: "address-1",
          _ultra_propertyinterest_value: propertyInterestId,
          ultra_requestdate: "2023-06-14T04:00:29Z",
          ultra_elevatorregistrationrequestid: "request-id-2",
          statuscode: "2",
        },
        {
          ultra_buildingaddressline1: "address-1",
          _ultra_propertyinterest_value: propertyInterestId,
          ultra_requestdate: "2023-07-14T04:00:29Z",
          ultra_elevatorregistrationrequestid: "request-id-2",
          statuscode: "240000000",
        },
        {
          ultra_buildingaddressline1: "address-1",
          _ultra_propertyinterest_value: propertyInterestId,
          ultra_requestdate: "2024-07-14T04:00:29Z",
          ultra_elevatorregistrationrequestid: "request-id-2",
          statuscode: "240000001",
        },
        {
          ultra_buildingaddressline1: "address-1",
          _ultra_propertyinterest_value: propertyInterestId,
          ultra_requestdate: "2024-01-14T04:00:29Z",
          ultra_elevatorregistrationrequestid: "request-id-2",
          statuscode: "240000002",
        },
        {
          ultra_buildingaddressline1: "address-1",
          _ultra_propertyinterest_value: propertyInterestId,
          ultra_requestdate: "2025-01-14T04:00:29Z",
          ultra_elevatorregistrationrequestid: "request-id-2",
          statuscode: "240000003",
        },
      ],
    };

    const elevatorDevicesMockResponse1 = { value: [{}, {}] };
    const elevatorDevicesMockResponse2 = { value: [{}, {}, {}] };

    mockAxios.get.mockResolvedValueOnce({ data: elevatorSafetyRegistrationMockResponse });
    mockAxios.get.mockResolvedValueOnce({ data: elevatorDevicesMockResponse1 });
    mockAxios.get.mockResolvedValueOnce({ data: elevatorDevicesMockResponse2 });
    mockAxios.get.mockResolvedValueOnce({ data: elevatorDevicesMockResponse1 });
    mockAxios.get.mockResolvedValueOnce({ data: elevatorDevicesMockResponse2 });
    mockAxios.get.mockResolvedValueOnce({ data: elevatorDevicesMockResponse1 });
    mockAxios.get.mockResolvedValueOnce({ data: elevatorDevicesMockResponse2 });
    expect(await client.getElevatorRegistrationsForBuilding(mockAccessToken, propertyInterestId)).toEqual([
      {
        dateStarted: "2021-06-14T04:00:29Z",
        deviceCount: 2,
        status: "IN REVIEW",
      },
      {
        dateStarted: "2023-06-14T04:00:29Z",
        deviceCount: 3,
        status: "CANCELLED",
      },
      {
        dateStarted: "2023-07-14T04:00:29Z",
        deviceCount: 2,
        status: "RETURNED",
      },
      {
        dateStarted: "2024-07-14T04:00:29Z",
        deviceCount: 3,
        status: "APPROVED",
      },
      {
        dateStarted: "2024-01-14T04:00:29Z",
        deviceCount: 2,
        status: "REJECTED",
      },
      {
        dateStarted: "2025-01-14T04:00:29Z",
        deviceCount: 3,
        status: "INCOMPLETE",
      },
    ]);
  });

  it("returns empty response for no registrations found", async () => {
    const elevatorSafetyRegistrationMockResponse = {
      value: [],
    };

    mockAxios.get.mockResolvedValueOnce({ data: elevatorSafetyRegistrationMockResponse });

    expect(await client.getElevatorRegistrationsForBuilding(mockAccessToken, propertyInterestId)).toEqual([]);
    expect(mockAxios.get).toHaveBeenCalledWith(
      `${ORG_URL}/api/data/v9.2/ultra_elevatorregistrationrequests?$select=createdon,statecode,statuscode&$filter=(_ultra_propertyinterest_value eq 'property-interest-id')`,
      {
        headers: {
          Authorization: `Bearer ${mockAccessToken}`,
        },
      }
    );
  });
});
