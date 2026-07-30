import { AWSCryptoFactory } from "@client/AwsCryptoFactory";
import { createDynamoDbClient } from "@db/config/dynamoDbConfig";
import { DynamoBusinessDataClient } from "@db/DynamoBusinessDataClient";
import { DynamoDataClient } from "@db/DynamoDataClient";
import { DynamoMigrationDataClient } from "@db/DynamoMigrationDataClient";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import { handler } from "@functions/migrateUsersVersion/app";
import { isKillSwitchOn } from "@libs/ssmUtils";

jest.mock("@client/AwsCryptoFactory");
jest.mock("@db/config/dynamoDbConfig");
jest.mock("@db/DynamoBusinessDataClient");
jest.mock("@db/DynamoDataClient");
jest.mock("@db/DynamoMigrationDataClient");
jest.mock("@db/DynamoUserDataClient");
jest.mock("@libs/ssmUtils");

describe("migrateUsersVersion handler", () => {
  const migrateOutdatedVersionUsers = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (isKillSwitchOn as jest.Mock).mockResolvedValue(false);
    (createDynamoDbClient as jest.Mock).mockReturnValue({});
    (AWSCryptoFactory as jest.Mock).mockReturnValue({});
    (DynamoUserDataClient as jest.Mock).mockReturnValue({});
    (DynamoBusinessDataClient as jest.Mock).mockReturnValue({});
    (DynamoMigrationDataClient as jest.Mock).mockReturnValue({});
    (DynamoDataClient as jest.Mock).mockReturnValue({ migrateOutdatedVersionUsers });
  });

  it("throws so Lambda Errors alarms and activates the kill switch", async () => {
    migrateOutdatedVersionUsers.mockResolvedValue({
      success: false,
      error: "AccessDeniedException",
    });

    await expect(handler()).rejects.toThrow("AccessDeniedException");
  });

  it("resolves when every user migration succeeds", async () => {
    migrateOutdatedVersionUsers.mockResolvedValue({
      success: true,
      migratedCount: 3,
    });

    await expect(handler()).resolves.toBeUndefined();
    expect(DynamoMigrationDataClient).toHaveBeenCalled();
  });

  it("stops starting users when the Lambda reaches its shutdown buffer", async () => {
    migrateOutdatedVersionUsers.mockResolvedValue({
      success: true,
      migratedCount: 1,
    });
    const getRemainingTimeInMillis = jest.fn().mockReturnValue(30_000);

    await handler(undefined, { getRemainingTimeInMillis });

    const options = migrateOutdatedVersionUsers.mock.calls[0][0];
    expect(options.canStartNextUser()).toBe(false);
  });
});
