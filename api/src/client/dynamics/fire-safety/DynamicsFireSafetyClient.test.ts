import { LogWriter, LogWriterType } from "@libs/logWriter";
import { AccessTokenClient } from "@client/dynamics/types";
import { FireSafetyInspectionClient } from "@client/dynamics/fire-safety/types";
import { DynamicsFireSafetyClient, FireSafetyInfo } from "@client/dynamics/fire-safety/DynamicsFireSafetyClient";

describe("DynamicsLicenseStatusClient", () => {
  let client: FireSafetyInfo;
  let logger: LogWriterType;

  let stubAccessTokenClient: jest.Mocked<AccessTokenClient>;
  let stubFireSafetyInspectionClient: jest.Mocked<FireSafetyInspectionClient>;

  beforeEach(async () => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");

    stubAccessTokenClient = {
      getAccessToken: jest.fn(),
    };

    stubFireSafetyInspectionClient = {
      getFireSafetyInspectionsByAddress: jest.fn(),
    }

    client = DynamicsFireSafetyClient(logger, {
      accessTokenClient: stubAccessTokenClient,
      fireSafetyInspectionClient: stubFireSafetyInspectionClient,
    });
  });

  it("returns inspection data from subclient", async () => {

    stubFireSafetyInspectionClient.getFireSafetyInspectionsByAddress.mockResolvedValue([
      {
        createdOn: "2024-05-31T10:31:51Z",
        inspectionFinished: true,
        address: "address-1",
        openViolationCount: 0
      },
      {
        createdOn: "2023-06-01T10:31:51Z",
        inspectionFinished: false,
        address: "address-1",
        openViolationCount: 5
      },
    ])


    const result = await client("address-1");

    expect(result).toEqual([
      {
        createdOn: "2024-05-31T10:31:51Z",
        inspectionFinished: true,
        address: "address-1",
        openViolationCount: 0
      },
      {
        createdOn: "2023-06-01T10:31:51Z",
        inspectionFinished: false,
        address: "address-1",
        openViolationCount: 5
      },
    ]);
  });

  it("returns inspection data from subclient", async () => {

    stubFireSafetyInspectionClient.getFireSafetyInspectionsByAddress.mockResolvedValue([
      {
        createdOn: "2024-05-31T10:31:51Z",
        inspectionFinished: true,
        address: "address-1",
        openViolationCount: 0
      },
      {
        createdOn: "2023-06-01T10:31:51Z",
        inspectionFinished: false,
        address: "address-1",
        openViolationCount: 5
      },
    ])


    const result = await client("address-1");

    expect(result).toEqual([
      {
        createdOn: "2024-05-31T10:31:51Z",
        inspectionFinished: true,
        address: "address-1",
        openViolationCount: 0
      },
      {
        createdOn: "2023-06-01T10:31:51Z",
        inspectionFinished: false,
        address: "address-1",
        openViolationCount: 5
      },
    ]);
  });

  it("throws a 400 error when a sub client client throws a 400", async () => {

    stubFireSafetyInspectionClient.getFireSafetyInspectionsByAddress.mockRejectedValue(new Error("400"));
    await expect(client("address-2")).rejects.toThrow("400");
  });

});