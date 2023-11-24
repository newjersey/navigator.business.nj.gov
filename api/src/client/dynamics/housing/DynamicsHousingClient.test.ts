import { AccessTokenClient } from "@client/dynamics/types";
import { LogWriter, LogWriterType } from "@libs/logWriter";

import { DynamicsHousingClient } from "@client/dynamics/housing/DynamicsHousingClient";
import { HousingPropertyInterestClient, HousingPropertyInterestInfo } from "@client/dynamics/housing/types";

describe("DynamicsHousingClient", () => {
  let client: HousingPropertyInterestInfo;
  let logger: LogWriterType;

  let stubAccessTokenClient: jest.Mocked<AccessTokenClient>;
  let stubHousingPropertyInterestClient: jest.Mocked<HousingPropertyInterestClient>;

  beforeEach(async () => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");

    stubAccessTokenClient = {
      getAccessToken: jest.fn(),
    };

    stubHousingPropertyInterestClient = {
      getPropertyInterests: jest.fn(),
    };

    client = DynamicsHousingClient(logger, {
      accessTokenClient: stubAccessTokenClient,
      housingPropertyInterestClient: stubHousingPropertyInterestClient,
    });
  });

  it("returns property interest data from subclient", async () => {
    stubHousingPropertyInterestClient.getPropertyInterests.mockResolvedValue([
      {
        createdOn: "2024-05-31T10:31:51Z",
        isFireSafety: true,
        isBHIRegistered: true,
        address: "address-1",
        BHINextInspectionDueDate: "01-01-2028",
        stateCode: 0,
      },
      {
        createdOn: "2023-06-01T10:31:51Z",
        isFireSafety: true,
        isBHIRegistered: false,
        address: "address-1",
        BHINextInspectionDueDate: "01-01-2028",
        stateCode: 1,
      },
    ]);

    const result = await client("address-1");

    expect(result).toEqual([
      {
        createdOn: "2024-05-31T10:31:51Z",
        isFireSafety: true,
        isBHIRegistered: true,
        address: "address-1",
        BHINextInspectionDueDate: "01-01-2028",
        stateCode: 0,
      },
      {
        createdOn: "2023-06-01T10:31:51Z",
        isFireSafety: true,
        isBHIRegistered: false,
        address: "address-1",
        BHINextInspectionDueDate: "01-01-2028",
        stateCode: 1,
      },
    ]);
  });

  it("throws a 400 error when a sub client client throws a 400", async () => {
    stubHousingPropertyInterestClient.getPropertyInterests.mockRejectedValue(new Error("400"));
    await expect(client("address-2")).rejects.toThrow("400");
  });
});
