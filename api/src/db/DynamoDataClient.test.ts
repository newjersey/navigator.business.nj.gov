import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { dynamoDbTranslateConfig } from "@db/config/dynamoDbConfig";
import { DynamoBusinessDataClient } from "@db/DynamoBusinessDataClient";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import {
  type BusinessesDataClient,
  type DatabaseClient,
  MigrationConflictError,
  type MigrationDataClient,
  type UserDataClient,
  type CryptoClient,
} from "@domain/types";
import { DummyLogWriter, type LogWriterType } from "@libs/logWriter";

import { DynamoDataClient } from "@db/DynamoDataClient";

import { randomInt } from "@shared/intHelpers";
import {
  generateBusiness,
  generateProfileData,
  generateTaxFilingData,
  generateUserDataForBusiness,
} from "@shared/test";
import { CURRENT_VERSION, type UserData } from "@shared/userData";
import dayjs from "dayjs";
import { getConfigValue } from "@libs/ssmUtils";
import { parseUserData } from "@db/zodSchema/zodSchemas";

jest.mock("@libs/ssmUtils");
jest.mock("@db/zodSchema/zodSchemas");

// references jest-dynalite-config values
const dbConfig = {
  tableName: "businesses-table-test",
};

const usersDbConfig = {
  tableName: "users-table-test",
};

const isKillSwitchOn = async (): Promise<boolean> => false;
const isKillSwitchOnTruePath = async (): Promise<boolean> => true;

describe("User and Business Migration with DynamoDataClient", () => {
  const config = {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    sslEnabled: false,
    region: "local",
  };

  let client: DynamoDBDocumentClient;
  let dynamoBusinessesDataClient: BusinessesDataClient;
  let logger: LogWriterType;
  let dynamoUsersDataClient: UserDataClient;
  let cryptoClient: CryptoClient;
  let migrationDataClient: jest.Mocked<MigrationDataClient>;

  let dynamoDataClient: DatabaseClient;

  const formationDate = dayjs().subtract(3, "year").add(1, "month").day(1).format("YYYY-MM-DD");
  const naicsCode = `naics-code-${randomInt()}`;
  const industry = `industry-${randomInt()}`;
  const encryptedTaxId = `encryptedId-${randomInt()}`;

  const generateUserData = (): UserData => {
    return generateUserDataForBusiness(
      generateBusiness({
        profileData: generateProfileData({
          dateOfFormation: formationDate,
          legalStructureId: "limited-liability-company",
          naicsCode: naicsCode,
          industryId: industry,
          encryptedTaxId: encryptedTaxId,
        }),
        taxFilingData: generateTaxFilingData({
          filings: [],
        }),
      }),
    );
  };
  const userData = generateUserData();

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const mockLogger = () => {
    logger.LogInfo = jest.fn();
    logger.LogError = jest.fn();
  };

  beforeEach(() => {
    jest.clearAllMocks();
    logger = DummyLogWriter;
    cryptoClient = {
      encryptValue: jest.fn(),
      decryptValue: jest.fn(),
      hashValue: jest.fn(),
    };
    client = DynamoDBDocumentClient.from(new DynamoDBClient(config), dynamoDbTranslateConfig);
    dynamoBusinessesDataClient = DynamoBusinessDataClient(client, dbConfig.tableName, logger);
    dynamoUsersDataClient = DynamoUserDataClient(
      client,
      cryptoClient,
      usersDbConfig.tableName,
      logger,
    );
    migrationDataClient = {
      migrateAndPut: jest.fn(async (input) => ({
        ...input,
        version: CURRENT_VERSION,
      })),
    };

    dynamoDataClient = DynamoDataClient(
      dynamoUsersDataClient,
      dynamoBusinessesDataClient,
      logger,
      isKillSwitchOn,
      migrationDataClient,
    );
    (dynamoBusinessesDataClient.put as jest.Mock) = jest.fn();
    (dynamoUsersDataClient.put as jest.Mock) = jest.fn();

    mockLogger();
    jest.spyOn(dynamoUsersDataClient, "put").mockImplementation(async (input) => input);
    jest
      .spyOn(dynamoBusinessesDataClient, "put")
      .mockResolvedValue(userData.businesses[userData.user.id]);
    jest.spyOn(dynamoUsersDataClient, "getUsersWithOutdatedVersion").mockResolvedValue({
      usersToMigrate: [userData],
      nextToken: undefined,
    });
  });

  it("should migrate data correctly", async () => {
    const result = await dynamoDataClient.migrateOutdatedVersionUsers();

    expect(result.success).toBe(true);
    expect(result.migratedCount).toBeGreaterThan(0);
    expect(migrationDataClient.migrateAndPut).toHaveBeenCalledWith(userData);
    expect(dynamoBusinessesDataClient.put).not.toHaveBeenCalled();
    expect(dynamoUsersDataClient.put).not.toHaveBeenCalled();
    expect(logger.LogInfo).toHaveBeenCalledWith(expect.stringContaining("Migration complete"));
  });

  it("should atomically migrate a user with no businesses", async () => {
    const userWithNoBusinesses = { ...userData, businesses: {} };

    jest.spyOn(dynamoUsersDataClient, "getUsersWithOutdatedVersion").mockResolvedValueOnce({
      usersToMigrate: [userWithNoBusinesses],
      nextToken: undefined,
    });

    await dynamoDataClient.migrateOutdatedVersionUsers();

    expect(migrationDataClient.migrateAndPut).toHaveBeenCalledWith(userWithNoBusinesses);
    expect(dynamoBusinessesDataClient.put).not.toHaveBeenCalled();
  });

  it("should log an error and rethrow when migration fails", async () => {
    const mockError = new Error("Unexpected failure during migration");

    jest.spyOn(dynamoUsersDataClient, "getUsersWithOutdatedVersion").mockRejectedValue(mockError);
    const result = await dynamoDataClient.migrateOutdatedVersionUsers();

    expect(result.success).toBe(false);
    expect(result.error).toBe(mockError.message);

    expect(logger.LogError).toHaveBeenCalledWith(`MigrateData Failed: ${mockError.message}`);

    expect(logger.LogInfo).not.toHaveBeenCalledWith("Successfully migrated business");
  });

  it("should log an info message when no users with outdated versions are found", async () => {
    jest.spyOn(dynamoUsersDataClient, "getUsersWithOutdatedVersion").mockResolvedValueOnce({
      usersToMigrate: [],
      nextToken: undefined,
    });

    const logSpy = jest.spyOn(logger, "LogInfo");

    await dynamoDataClient.migrateOutdatedVersionUsers();

    expect(logSpy).toHaveBeenCalledWith(
      `Migration complete. Migrated 0 users. Current version: ${CURRENT_VERSION}`,
    );
  });

  it("should handle pagination correctly when nextToken exists", async () => {
    const userDataBatch1 = generateUserData();
    const userDataBatch2 = generateUserData();
    const userDataBatch3 = generateUserData();

    const nextTokenBatch1: string = "nextTokenBatch1";
    const nextTokenBatch2: string = "nextTokenBatch2";
    jest
      .spyOn(dynamoUsersDataClient, "getUsersWithOutdatedVersion")
      .mockResolvedValueOnce({
        usersToMigrate: [userDataBatch1],
        nextToken: nextTokenBatch1,
      })
      .mockResolvedValueOnce({
        usersToMigrate: [userDataBatch2],
        nextToken: nextTokenBatch2,
      })
      .mockResolvedValueOnce({
        usersToMigrate: [userDataBatch3],
        nextToken: undefined,
      });
    const logSpy = jest.spyOn(logger, "LogInfo");

    const result = await dynamoDataClient.migrateOutdatedVersionUsers();
    expect(result.migratedCount).toBe(3);
    expect(migrationDataClient.migrateAndPut).toHaveBeenCalledTimes(3);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Migration complete"));
    expect(dynamoUsersDataClient.getUsersWithOutdatedVersion).toHaveBeenCalledTimes(3);
    expect(dynamoUsersDataClient.getUsersWithOutdatedVersion).toHaveBeenCalledWith(
      CURRENT_VERSION,
      undefined,
    );
    expect(dynamoUsersDataClient.getUsersWithOutdatedVersion).toHaveBeenCalledWith(
      CURRENT_VERSION,
      nextTokenBatch1,
    );
    expect(dynamoUsersDataClient.getUsersWithOutdatedVersion).toHaveBeenCalledWith(
      CURRENT_VERSION,
      nextTokenBatch1,
    );
    expect(dynamoUsersDataClient.getUsersWithOutdatedVersion).toHaveBeenCalledWith(
      CURRENT_VERSION,
      nextTokenBatch2,
    );
  });

  it("should return user when business name matches", async () => {
    const user = generateUserData();
    const business = user.businesses[user.currentBusinessId];
    const businessName = user.businesses[user.currentBusinessId]?.profileData.businessName;

    jest.spyOn(dynamoBusinessesDataClient, "findByBusinessName").mockResolvedValueOnce({
      ...business,
      userId: user.user.id,
    });

    jest.spyOn(dynamoUsersDataClient, "get").mockResolvedValueOnce(user);
    const result = await dynamoDataClient.findUserByBusinessName(businessName);
    expect(result).toEqual(user);
    expect(dynamoBusinessesDataClient.findByBusinessName).toHaveBeenCalledWith(businessName);
    expect(dynamoUsersDataClient.get).toHaveBeenCalledWith(business.userId);
  });

  it("should return undefined and log info when no business is found", async () => {
    const businessName = "Nonexistent Corp";
    jest.spyOn(dynamoBusinessesDataClient, "findByBusinessName").mockResolvedValueOnce(void 0);

    const result = await dynamoDataClient.findUserByBusinessName(businessName);

    expect(result).toBeUndefined();
    expect(logger.LogInfo).toHaveBeenCalledWith(`No Business Found with name: ${businessName}`);
  });

  it("should return users whose business names match the given prefix", async () => {
    const prefix = "some-business";
    const user1 = generateUserData();
    const user2 = generateUserData();

    const business1 = user1.businesses[user1.currentBusinessId];
    const business2 = user2.businesses[user2.currentBusinessId];

    jest.spyOn(dynamoBusinessesDataClient, "findBusinessesByNamePrefix").mockResolvedValue([
      { ...business1, userId: user1.user.id },
      { ...business2, userId: user2.user.id },
    ]);

    jest
      .spyOn(dynamoUsersDataClient, "get")
      .mockResolvedValueOnce(user1)
      .mockResolvedValueOnce(user2);

    const result = await dynamoDataClient.findUsersByBusinessNamePrefix(prefix);

    expect(result).toContainEqual(user1);
    expect(result).toContainEqual(user2);
    expect(dynamoUsersDataClient.get).toHaveBeenCalledTimes(2);
  });

  it("should return an empty array if no business names match the given prefix", async () => {
    const prefix = "non-matching-prefix";

    jest.spyOn(dynamoBusinessesDataClient, "findBusinessesByNamePrefix").mockResolvedValue([]);
    const mockGet = jest.spyOn(dynamoUsersDataClient, "get");
    const result = await dynamoDataClient.findUsersByBusinessNamePrefix(prefix);

    expect(result).toEqual([]);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("should skip migration when kill switch flag is true", async () => {
    dynamoDataClient = DynamoDataClient(
      dynamoUsersDataClient,
      dynamoBusinessesDataClient,
      logger,
      isKillSwitchOnTruePath,
      migrationDataClient,
    );
    const putBusinessesSpy = jest.spyOn(dynamoBusinessesDataClient, "put");
    const putUsersSpy = jest.spyOn(dynamoUsersDataClient, "put");

    const result = await dynamoDataClient.migrateOutdatedVersionUsers();
    expect(result.success).toBe(true);
    expect(result.migratedCount).toBe(0);
    expect(putBusinessesSpy).not.toHaveBeenCalled();
    expect(putUsersSpy).not.toHaveBeenCalled();
    expect(logger.LogInfo).toHaveBeenCalledWith("Migration halted: kill switch is ON");
  });

  it("returns the unchanged stored record when request-time migration fails", async () => {
    const outdatedUser = { ...generateUserData(), version: CURRENT_VERSION - 1 };
    jest.spyOn(dynamoUsersDataClient, "get").mockResolvedValueOnce(outdatedUser);
    migrationDataClient.migrateAndPut.mockRejectedValueOnce(new Error("KMS unavailable"));

    await expect(dynamoDataClient.get(outdatedUser.user.id)).resolves.toEqual(outdatedUser);
    expect(dynamoUsersDataClient.put).not.toHaveBeenCalled();
    expect(dynamoBusinessesDataClient.put).not.toHaveBeenCalled();
    expect(logger.LogError).toHaveBeenCalledWith(
      `Request-time migration failed from version ${
        CURRENT_VERSION - 1
      } to ${CURRENT_VERSION}: KMS unavailable`,
    );
  });

  it("returns the unchanged stored record when the request-time kill switch is on", async () => {
    const outdatedUser = { ...generateUserData(), version: CURRENT_VERSION - 1 };
    jest.spyOn(dynamoUsersDataClient, "get").mockResolvedValueOnce(outdatedUser);
    dynamoDataClient = DynamoDataClient(
      dynamoUsersDataClient,
      dynamoBusinessesDataClient,
      logger,
      isKillSwitchOnTruePath,
      migrationDataClient,
    );

    await expect(dynamoDataClient.get(outdatedUser.user.id)).resolves.toEqual(outdatedUser);
    expect(migrationDataClient.migrateAndPut).not.toHaveBeenCalled();
  });

  it("stops the scheduled migration after the first terminal user failure", async () => {
    const first = generateUserData();
    const second = generateUserData();
    jest.spyOn(dynamoUsersDataClient, "getUsersWithOutdatedVersion").mockResolvedValueOnce({
      usersToMigrate: [first, second],
      nextToken: undefined,
    });
    migrationDataClient.migrateAndPut.mockRejectedValueOnce(new Error("AccessDeniedException"));

    const result = await dynamoDataClient.migrateOutdatedVersionUsers();

    expect(result).toEqual({ success: false, error: "AccessDeniedException" });
    expect(migrationDataClient.migrateAndPut).toHaveBeenCalledTimes(1);
    expect(logger.LogError).toHaveBeenCalledWith(
      `Scheduled migration failed for user ${first.user.id} from version ${first.version} to ${CURRENT_VERSION}: AccessDeniedException`,
    );
  });

  it("continues scheduled migration after a retryable transaction conflict", async () => {
    const first = generateUserData();
    const second = generateUserData();
    jest.spyOn(dynamoUsersDataClient, "getUsersWithOutdatedVersion").mockResolvedValueOnce({
      usersToMigrate: [first, second],
      nextToken: undefined,
    });
    migrationDataClient.migrateAndPut.mockRejectedValueOnce(new MigrationConflictError());

    const result = await dynamoDataClient.migrateOutdatedVersionUsers();

    expect(result).toEqual({ success: true, migratedCount: 1 });
    expect(migrationDataClient.migrateAndPut).toHaveBeenCalledTimes(2);
    expect(logger.LogInfo).toHaveBeenCalledWith(
      "Skipped migration because the user record changed concurrently",
    );
    expect(logger.LogError).not.toHaveBeenCalledWith(
      expect.stringContaining("Scheduled migration failed"),
    );
  });

  it("stops successfully between users when the Lambda time budget is exhausted", async () => {
    const first = generateUserData();
    const second = generateUserData();
    jest.spyOn(dynamoUsersDataClient, "getUsersWithOutdatedVersion").mockResolvedValueOnce({
      usersToMigrate: [first, second],
      nextToken: undefined,
    });
    const canStartNextUser = jest.fn().mockReturnValueOnce(true).mockReturnValueOnce(false);

    const result = await dynamoDataClient.migrateOutdatedVersionUsers({ canStartNextUser });

    expect(result).toEqual({ success: true, migratedCount: 1 });
    expect(migrationDataClient.migrateAndPut).toHaveBeenCalledTimes(1);
    expect(migrationDataClient.migrateAndPut).toHaveBeenCalledWith(first);
    expect(logger.LogInfo).toHaveBeenCalledWith(
      "Migration paused before Lambda timeout; remaining users will retry",
    );
  });

  it("should call parseUserData when zod_parsing_on feature flag is true", async () => {
    (getConfigValue as jest.Mock).mockResolvedValue("true");
    (parseUserData as jest.Mock).mockImplementation(() => {});

    const result = await dynamoDataClient.migrateOutdatedVersionUsers();

    expect(result.success).toBe(true);
    expect(result.migratedCount).toBe(1);
    expect(getConfigValue).toHaveBeenCalledWith("zod_parsing_on", logger);
    expect(parseUserData).toHaveBeenCalledWith(logger, userData);
    expect(parseUserData).toHaveBeenCalledTimes(1);
  });

  it("should not call parseUserData when zod_parsing_on feature flag is false", async () => {
    (getConfigValue as jest.Mock).mockResolvedValue("false");
    (parseUserData as jest.Mock).mockImplementation(() => {});

    const result = await dynamoDataClient.migrateOutdatedVersionUsers();

    expect(result.success).toBe(true);
    expect(result.migratedCount).toBe(1);
    expect(getConfigValue).toHaveBeenCalledWith("zod_parsing_on", logger);
    expect(parseUserData).not.toHaveBeenCalled();
  });

  it("should not call parseUserData when zod_parsing_on feature flag is empty string", async () => {
    (getConfigValue as jest.Mock).mockResolvedValue("");
    (parseUserData as jest.Mock).mockImplementation(() => {});

    const result = await dynamoDataClient.migrateOutdatedVersionUsers();

    expect(result.success).toBe(true);
    expect(result.migratedCount).toBe(1);
    expect(getConfigValue).toHaveBeenCalledWith("zod_parsing_on", logger);
    expect(parseUserData).not.toHaveBeenCalled();
  });
});
