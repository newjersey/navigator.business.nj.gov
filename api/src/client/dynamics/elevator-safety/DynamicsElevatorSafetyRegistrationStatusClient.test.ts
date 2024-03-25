import { DynamicsElevatorSafetyRegistrationStatusClient } from "@client/dynamics/elevator-safety/DynamicsElevatorSafetyRegistrationStatusClient";
import { ElevatorSafetyRegistrationClient } from "@client/dynamics/elevator-safety/types";
import { HousingPropertyInterestClient } from "@client/dynamics/housing/types";
import { AccessTokenClient } from "@client/dynamics/types";
import { ElevatorSafetyRegistrationStatus } from "@domain/types";
import { LogWriter, LogWriterType } from "@libs/logWriter";

jest.mock("axios");
jest.mock("winston");

describe("DynamicsElevatorSafetyRegistrationStatusClient", () => {
  let client: ElevatorSafetyRegistrationStatus;
  let stubAccessTokenClient: jest.Mocked<AccessTokenClient>;
  let stubHousingAcessTokenClient: jest.Mocked<AccessTokenClient>;
  let stubHousingClient: jest.Mocked<HousingPropertyInterestClient>;
  let stubElevatorRegistrationClient: jest.Mocked<ElevatorSafetyRegistrationClient>;
  let logger: LogWriterType;

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");

    stubHousingClient = {
      getPropertyInterest: jest.fn(),
    };

    stubHousingAcessTokenClient = {
      getAccessToken: jest.fn(),
    };

    stubAccessTokenClient = {
      getAccessToken: jest.fn(),
    };

    stubElevatorRegistrationClient = {
      getElevatorRegistrationsForBuilding: jest.fn(),
    };

    client = DynamicsElevatorSafetyRegistrationStatusClient(logger, {
      accessTokenClient: stubAccessTokenClient,
      housingPropertyInterestClient: stubHousingClient,
      elevatorRegistrationClient: stubElevatorRegistrationClient,
      housingAccessTokenClient: stubHousingAcessTokenClient,
    });
  });

  it("returns no property interest found for no property interest", async () => {
    let propertyInterestUndefined;
    stubHousingClient.getPropertyInterest.mockResolvedValue(propertyInterestUndefined);

    expect(await client("address-1", "12345")).toEqual({
      lookupStatus: "NO PROPERTY INTERESTS FOUND",
      registrations: [],
    });
  });

  it("returns no registrations if property interest is found without registrations", async () => {
    stubHousingClient.getPropertyInterest.mockResolvedValue({
      createdOn: "2023-05-31T10:31:51Z",
      isFireSafety: true,
      isBHIRegistered: false,
      address: "123 Street",
      BHINextInspectionDueDate: "01/01/2028",
      stateCode: 0,
      id: "12345",
    });
    stubElevatorRegistrationClient.getElevatorRegistrationsForBuilding.mockResolvedValue([]);

    expect(await client("address-1", "12345")).toEqual({
      lookupStatus: "NO REGISTRATIONS FOUND",
      registrations: [],
    });
  });

  it("collates multiple registrations in different states", async () => {
    stubHousingClient.getPropertyInterest.mockResolvedValue({
      createdOn: "2023-05-31T10:31:51Z",
      isFireSafety: true,
      isBHIRegistered: false,
      address: "123 Street",
      BHINextInspectionDueDate: "01/01/2028",
      stateCode: 0,
      id: "12345",
    });
    stubElevatorRegistrationClient.getElevatorRegistrationsForBuilding.mockResolvedValue([
      {
        dateStarted: "2022-07-14T04:00:29Z",
        deviceCount: 2,
        status: "IN REVIEW",
      },
      {
        dateStarted: "2021-06-14T04:00:29Z",
        deviceCount: 3,
        status: "APPROVED",
      },
    ]);

    expect(await client("address-1", "12345")).toEqual({
      lookupStatus: "SUCCESSFUL",
      registrations: [
        {
          dateStarted: "2022-07-14T04:00:29Z",
          deviceCount: 2,
          status: "IN REVIEW",
        },
        {
          dateStarted: "2021-06-14T04:00:29Z",
          deviceCount: 3,
          status: "APPROVED",
        },
      ],
    });
  });

  it("does not combine registrations from different dates in same state", async () => {
    stubHousingClient.getPropertyInterest.mockResolvedValue({
      createdOn: "2023-05-31T10:31:51Z",
      isFireSafety: true,
      isBHIRegistered: false,
      address: "123 Street",
      BHINextInspectionDueDate: "01/01/2028",
      stateCode: 0,
      id: "12345",
    });
    stubElevatorRegistrationClient.getElevatorRegistrationsForBuilding.mockResolvedValue([
      {
        dateStarted: "2022-07-14T04:00:29Z",
        deviceCount: 2,
        status: "IN REVIEW",
      },
      {
        dateStarted: "2021-06-14T04:00:29Z",
        deviceCount: 1,
        status: "IN REVIEW",
      },
    ]);

    expect(await client("address-1", "12345")).toEqual({
      lookupStatus: "SUCCESSFUL",
      registrations: [
        {
          dateStarted: "2022-07-14T04:00:29Z",
          deviceCount: 2,
          status: "IN REVIEW",
        },
        {
          dateStarted: "2021-06-14T04:00:29Z",
          deviceCount: 1,
          status: "IN REVIEW",
        },
      ],
    });
  });
});
