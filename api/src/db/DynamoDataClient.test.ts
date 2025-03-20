import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { dynamoDbTranslateConfig } from "@db/config/dynamoDbConfig";
import { DynamoBusinessDataClient } from "@db/DynamoBusinessDataClient";
import { DynamoDataClient } from "@db/DynamoDataClient";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import { BusinessesDataClient, DatabaseClient, UserDataClient } from "@domain/types";
import { DummyLogWriter, LogWriterType } from "@libs/logWriter";

import { randomInt } from "@shared/intHelpers";
import {
  generateBusiness,
  generateProfileData,
  generateTaxFilingData,
  generateUserDataForBusiness,
} from "@shared/test";
import { CURRENT_VERSION, UserData } from "@shared/userData";
import dayjs from "dayjs";

// references jest-dynalite-config values
const dbConfig = {
  tableName: "businesses-table-test",
};

const usersDbConfig = {
  tableName: "users-table-test",
};

type MockedLimitFunction<T> = (fn: () => Promise<T>) => Promise<T>;

const mockLimitFunction: MockedLimitFunction<UserData> = async (fn) => {
  return fn();
};

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
      })
    );
  };
  const userData = generateUserData();

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const mockLogger = () => {
    logger.LogInfo = jest.fn();
    logger.LogError = jest.fn();
  };

  beforeEach(() => {
    logger = DummyLogWriter;
    client = DynamoDBDocumentClient.from(new DynamoDBClient(config), dynamoDbTranslateConfig);
    dynamoBusinessesDataClient = DynamoBusinessDataClient(client, dbConfig.tableName, logger);
    dynamoUsersDataClient = DynamoUserDataClient(client, usersDbConfig.tableName, logger);

    dynamoDataClient = DynamoDataClient(dynamoUsersDataClient, dynamoBusinessesDataClient, logger);

    (dynamoBusinessesDataClient.batchWriteToTable as jest.Mock) = jest.fn();
    (dynamoUsersDataClient.batchWriteToTable as jest.Mock) = jest.fn();

    mockLogger();

    jest.mock("p-limit", () => {
      return jest.fn(() => mockLimitFunction);
    });

    jest.spyOn(dynamoUsersDataClient, "getUsersWithOutdatedVersion").mockResolvedValue({
      usersToMigrate: [userData],
      nextToken: undefined,
    });
  });

  it("should migrate data correctly", async () => {
    const result = await dynamoDataClient.migrateOutdatedVersionUsers();
    expect(result.success).toBe(true);
    expect(result.migratedCount).toBeGreaterThan(0);
    expect(dynamoUsersDataClient.batchWriteToTable).toHaveBeenCalledTimes(1);
    expect(dynamoBusinessesDataClient.batchWriteToTable).toHaveBeenCalledTimes(1);
    expect(logger.LogInfo).toHaveBeenCalledWith(expect.stringContaining("Migration complete"));
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
      `Migration complete. Migrated 0 users. Current version: ${CURRENT_VERSION}`
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
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Migration complete"));
    expect(dynamoUsersDataClient.getUsersWithOutdatedVersion).toHaveBeenCalledTimes(3);
    expect(dynamoUsersDataClient.getUsersWithOutdatedVersion).toHaveBeenCalledWith(
      CURRENT_VERSION,
      undefined
    );
    expect(dynamoUsersDataClient.getUsersWithOutdatedVersion).toHaveBeenCalledWith(
      CURRENT_VERSION,
      nextTokenBatch1
    );
    expect(dynamoUsersDataClient.getUsersWithOutdatedVersion).toHaveBeenCalledWith(
      CURRENT_VERSION,
      nextTokenBatch1
    );
    expect(dynamoUsersDataClient.getUsersWithOutdatedVersion).toHaveBeenCalledWith(
      CURRENT_VERSION,
      nextTokenBatch2
    );
  });
});
