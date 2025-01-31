import { DynamicsFireSafetyClient } from "@client/dynamics/fire-safety/DynamicsFireSafetyClient";
import { FireSafetyInfo, FireSafetyInspectionClient } from "@client/dynamics/fire-safety/types";
import { AccessTokenClient } from "@client/dynamics/types";
import { DummyLogWriter, LogWriter, LogWriterType } from "@libs/logWriter";

const DEBUG = Boolean(process.env.DEBUG ?? false);

describe("DynamicsFireSafetyClient", () => {
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
      getFireSafetyInspections: jest.fn(),
    };

    client = DynamicsFireSafetyClient(DEBUG ? logger : DummyLogWriter, {
      accessTokenClient: stubAccessTokenClient,
      fireSafetyInspectionClient: stubFireSafetyInspectionClient,
    });
  });

  it("returns inspection data from subclient", async () => {
    stubFireSafetyInspectionClient.getFireSafetyInspections.mockResolvedValue([
      {
        createdOn: "2024-05-31T10:31:51Z",
        inspectionFinished: true,
        address: "address-1",
        openViolationCount: 0,
      },
      {
        createdOn: "2023-06-01T10:31:51Z",
        inspectionFinished: false,
        address: "address-1",
        openViolationCount: 5,
      },
    ]);

    const result = await client("address-1");

    expect(result).toEqual([
      {
        createdOn: "2024-05-31T10:31:51Z",
        inspectionFinished: true,
        address: "address-1",
        openViolationCount: 0,
      },
      {
        createdOn: "2023-06-01T10:31:51Z",
        inspectionFinished: false,
        address: "address-1",
        openViolationCount: 5,
      },
    ]);
  });

  it("throws a 400 error when a sub client client throws a 400", async () => {
    stubFireSafetyInspectionClient.getFireSafetyInspections.mockRejectedValue(new Error("400"));
    await expect(client("address-2")).rejects.toThrow("400");
  });
});
