import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { dynamoDbTranslateConfig } from "@db/config/dynamoDbConfig";
import { DynamoBusinessDataClient } from "@db/DynamoBusinessDataClient";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import { BusinessesDataClient, DatabaseClient, UserDataClient } from "@domain/types";
import { DummyLogWriter, LogWriterType } from "@libs/logWriter";

import { DynamoDataClient } from "@db/DynamoDataClient";

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
    (dynamoBusinessesDataClient.put as jest.Mock) = jest.fn();
    (dynamoUsersDataClient.put as jest.Mock) = jest.fn();

    mockLogger();
    jest.spyOn(dynamoBusinessesDataClient, "put").mockResolvedValue(userData.businesses[userData.user.id]);
    jest.spyOn(dynamoUsersDataClient, "getUsersWithOutdatedVersion").mockResolvedValue({
      usersToMigrate: [userData],
      nextToken: undefined,
    });
  });

  it("should migrate data correctly", async () => {
    const result = await dynamoDataClient.migrateData();

    expect(result.success).toBe(true);
    expect(result.migratedCount).toBeGreaterThan(0);
    expect(dynamoBusinessesDataClient.put).toHaveBeenCalledTimes(1);
    const businessId = userData.businesses[userData.currentBusinessId].id;
    expect(dynamoBusinessesDataClient.put).toHaveBeenCalledWith(expect.objectContaining({ id: businessId }));
    expect(logger.LogInfo).toHaveBeenCalledWith(
      expect.stringContaining(`Processed user ${userData.user.id} in the user data table`)
    );
    expect(logger.LogInfo).toHaveBeenCalledWith(
      expect.stringContaining(`Updated business ${businessId} for user ${userData.user.id}`)
    );
    expect(logger.LogInfo).toHaveBeenCalledWith(
      expect.stringContaining(`Processed business with ID ${businessId} for user ${userData.user.id}`)
    );
    expect(logger.LogInfo).toHaveBeenCalledWith(expect.stringContaining("Migration complete"));
  });

  it("should log an error when no businesses are found for a user", async () => {
    userData.businesses = {};

    jest.spyOn(dynamoUsersDataClient, "getUsersWithOutdatedVersion").mockResolvedValueOnce({
      usersToMigrate: [userData],
      nextToken: undefined,
    });

    await dynamoDataClient.migrateData();

    expect(logger.LogInfo).toHaveBeenCalledWith(`No businesses found for user ${userData.user.id}`);
    expect(dynamoBusinessesDataClient.put).not.toHaveBeenCalled();
  });

  it("should log an error and rethrow when migration fails", async () => {
    const mockError = new Error("Unexpected failure during migration");

    jest.spyOn(dynamoUsersDataClient, "getUsersWithOutdatedVersion").mockRejectedValue(mockError);
    const result = await dynamoDataClient.migrateData();

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

    await dynamoDataClient.migrateData();

    expect(logSpy).toHaveBeenCalledWith(
      `Migration complete. Migrated 0 users. Current version: ${CURRENT_VERSION}`
    );
  });

  it("should handle pagination correctly when nextToken exists", async () => {
    const userDataBatch1 = generateUserData();
    const userDataBatch2 = generateUserData();
    const userDataBatch3 = generateUserData();

    const businessId1 = userDataBatch1.businesses[userDataBatch1.currentBusinessId].id;
    const businessId2 = userDataBatch2.businesses[userDataBatch2.currentBusinessId].id;
    const businessId3 = userDataBatch3.businesses[userDataBatch3.currentBusinessId].id;

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

    const result = await dynamoDataClient.migrateData();
    expect(result.migratedCount).toBe(3);
    expect(logger.LogInfo).toHaveBeenCalledWith(
      expect.stringContaining(`Processed user ${userDataBatch1.user.id} in the user data table`)
    );
    expect(logger.LogInfo).toHaveBeenCalledWith(
      expect.stringContaining(`Updated business ${businessId1} for user ${userDataBatch1.user.id}`)
    );
    expect(logger.LogInfo).toHaveBeenCalledWith(
      expect.stringContaining(`Processed business with ID ${businessId1} for user ${userDataBatch1.user.id}`)
    );

    expect(logger.LogInfo).toHaveBeenCalledWith(
      expect.stringContaining(`Processed user ${userDataBatch2.user.id} in the user data table`)
    );
    expect(logger.LogInfo).toHaveBeenCalledWith(
      expect.stringContaining(`Updated business ${businessId2} for user ${userDataBatch2.user.id}`)
    );
    expect(logger.LogInfo).toHaveBeenCalledWith(
      expect.stringContaining(`Processed business with ID ${businessId2} for user ${userDataBatch2.user.id}`)
    );

    expect(logger.LogInfo).toHaveBeenCalledWith(
      expect.stringContaining(`Processed user ${userDataBatch3.user.id} in the user data table`)
    );
    expect(logger.LogInfo).toHaveBeenCalledWith(
      expect.stringContaining(`Updated business ${businessId3} for user ${userDataBatch3.user.id}`)
    );
    expect(logger.LogInfo).toHaveBeenCalledWith(
      expect.stringContaining(`Processed business with ID ${businessId3} for user ${userDataBatch3.user.id}`)
    );
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
