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
      getPropertyInterest: jest.fn(),
    };

    client = DynamicsHousingClient(logger, {
      accessTokenClient: stubAccessTokenClient,
      housingPropertyInterestClient: stubHousingPropertyInterestClient,
    });
  });

  it("returns property interest data from subclient", async () => {
    stubHousingPropertyInterestClient.getPropertyInterest.mockResolvedValue({
      createdOn: "2024-05-31T10:31:51Z",
      isFireSafety: true,
      isBHIRegistered: true,
      address: "address-1",
      BHINextInspectionDueDate: "01-01-2028",
      stateCode: 0,
      id: "12345",
      buildingCount: 2,
    });

    const result = await client("address-1", "12345");

    expect(result).toEqual({
      createdOn: "2024-05-31T10:31:51Z",
      isFireSafety: true,
      isBHIRegistered: true,
      address: "address-1",
      BHINextInspectionDueDate: "01-01-2028",
      stateCode: 0,
      id: "12345",
      buildingCount: 2,
    });
  });

  it("throws a 400 error when a sub client client throws a 400", async () => {
    stubHousingPropertyInterestClient.getPropertyInterest.mockRejectedValue(new Error("400"));
    await expect(client("address-2", "12345")).rejects.toThrow("400");
  });
});
