import { type DynamoDBDocumentClient, TransactWriteCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoMigrationDataClient } from "@db/DynamoMigrationDataClient";
import {
  MigrationConflictError,
  type MigrationDataClient,
  type UserDataClient,
} from "@domain/types";
import {
  generateBusiness,
  generateProfileData,
  generateUser,
  generateUserData,
} from "@shared/test";
import { CURRENT_VERSION, type UserData } from "@shared/userData";

const usersTableName = "users-table";
const businessesTableName = "businesses-table";

const generateOutdatedUser = (businessCount = 2): UserData => {
  const userId = "migration-user";
  const businesses = Object.fromEntries(
    Array.from({ length: businessCount }, (_, index) => {
      const businessId = `${userId}-business-${index}`;
      return [
        businessId,
        generateBusiness({
          id: businessId,
          userId,
          version: CURRENT_VERSION - 1,
          profileData: generateProfileData({ businessName: `Business ${index}` }),
        }),
      ];
    }),
  );

  return generateUserData({
    user: generateUser({ id: userId }),
    version: CURRENT_VERSION - 1,
    currentBusinessId: Object.keys(businesses)[0],
    businesses,
  });
};

const migrateUser = (source: UserData): UserData => ({
  ...source,
  version: CURRENT_VERSION,
  businesses: Object.fromEntries(
    Object.entries(source.businesses).map(([id, business]) => [
      id,
      { ...business, version: CURRENT_VERSION },
    ]),
  ),
});

describe("DynamoMigrationDataClient", () => {
  let send: jest.Mock;
  let userDataClient: jest.Mocked<UserDataClient>;

  beforeEach(() => {
    send = jest.fn().mockResolvedValue({});
    userDataClient = {
      get: jest.fn(),
      findByEmail: jest.fn(),
      put: jest.fn(),
      migrateToLatest: jest.fn(async (source) => migrateUser(source)),
      getNeedNewsletterUsers: jest.fn(),
      getNeedTaxIdEncryptionUsers: jest.fn(),
      getUsersWithOutdatedVersion: jest.fn(),
    };
  });

  const makeClient = (): MigrationDataClient =>
    DynamoMigrationDataClient({
      db: { send } as unknown as DynamoDBDocumentClient,
      userDataClient,
      usersTableName,
      businessesTableName,
    });

  it("writes the user and every business in one conditional transaction", async () => {
    const source = generateOutdatedUser();

    const result = await makeClient().migrateAndPut(source);

    expect(result.version).toBe(CURRENT_VERSION);
    expect(send).toHaveBeenCalledTimes(1);
    const command = send.mock.calls[0][0] as TransactWriteCommand;
    expect(command.input.TransactItems).toHaveLength(3);
    expect(command.input.TransactItems?.[0].Put).toMatchObject({
      TableName: usersTableName,
      ConditionExpression: "#data = :sourceData",
      ExpressionAttributeValues: { ":sourceData": source },
      Item: { userId: source.user.id, version: CURRENT_VERSION },
    });
    expect(command.input.TransactItems?.slice(1).map((item) => item.Put?.TableName)).toEqual([
      businessesTableName,
      businessesTableName,
    ]);
    expect(
      command.input.TransactItems?.slice(1).map((item) => item.Put?.Item?.data.version),
    ).toEqual([CURRENT_VERSION, CURRENT_VERSION]);
  });

  it("does not write when any field migration fails", async () => {
    const source = generateOutdatedUser();
    const original = structuredClone(source);
    userDataClient.migrateToLatest.mockRejectedValueOnce(new Error("KMS unavailable"));

    await expect(makeClient().migrateAndPut(source)).rejects.toThrow("KMS unavailable");

    expect(send).not.toHaveBeenCalled();
    expect(source).toEqual(original);
  });

  it("classifies a conditional transaction cancellation as concurrent migration", async () => {
    send.mockRejectedValueOnce({
      name: "TransactionCanceledException",
      CancellationReasons: [{ Code: "ConditionalCheckFailed" }],
    });

    await expect(makeClient().migrateAndPut(generateOutdatedUser())).rejects.toBeInstanceOf(
      MigrationConflictError,
    );
  });

  it("classifies a transaction collision as a retryable migration conflict", async () => {
    send.mockRejectedValueOnce({
      name: "TransactionCanceledException",
      CancellationReasons: [{ Code: "None" }, { Code: "TransactionConflict" }],
    });

    await expect(makeClient().migrateAndPut(generateOutdatedUser())).rejects.toBeInstanceOf(
      MigrationConflictError,
    );
  });

  it("rejects users that exceed DynamoDB's 100-item transaction limit", async () => {
    await expect(makeClient().migrateAndPut(generateOutdatedUser(100))).rejects.toThrow(
      "Cannot atomically migrate user with more than 99 businesses",
    );
    expect(userDataClient.migrateToLatest).not.toHaveBeenCalled();
    expect(send).not.toHaveBeenCalled();
  });
});
