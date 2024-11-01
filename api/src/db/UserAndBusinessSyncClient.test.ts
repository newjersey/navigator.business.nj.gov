import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { dynamoDbTranslateConfig } from "@db/config/dynamoDbConfig";
import { DynamoBusinessesDataClient } from "@db/DynamoBusinessesDataClient";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import { BusinessesDataClient, UserDataClient } from "@domain/types";
import { DummyLogWriter, LogWriterType } from "@libs/logWriter";

import { UserAndBusinessSyncClient } from "@db/UserAndBusinessSyncClient"; // import the UserAndBusinessSyncClient

import { randomInt } from "@shared/intHelpers";
import {
  generateBusiness,
  generateProfileData,
  generateTaxFilingData,
  generateUserDataForBusiness,
} from "@shared/test";
import { UserData } from "@shared/userData";
import dayjs from "dayjs";

// references jest-dynalite-config values
const dbConfig = {
  tableName: "businesses-table-test",
};

const usersDbConfig = {
  tableName: "users-table-test",
};

describe("User and Business Migration with UserAndBusinessSyncClient", () => {
  const config = {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    sslEnabled: false,
    region: "local",
  };

  let client: DynamoDBDocumentClient;
  let dynamoBusinessesDataClient: BusinessesDataClient;
  let logger: LogWriterType;
  let dynamoUsersDataClient: UserDataClient;

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
    dynamoBusinessesDataClient = DynamoBusinessesDataClient(client, dbConfig.tableName, logger);
    dynamoUsersDataClient = DynamoUserDataClient(client, usersDbConfig.tableName, logger);

    (dynamoBusinessesDataClient.put as jest.Mock) = jest.fn();
    (dynamoUsersDataClient.put as jest.Mock) = jest.fn();

    mockLogger();
    jest.spyOn(dynamoBusinessesDataClient, "put").mockResolvedValue(userData.businesses[userData.user.id]);
    jest.spyOn(dynamoUsersDataClient, "getUsersWithOutdatedVersion").mockResolvedValue([userData]);
  });

  it("should migrate users and their businesses correctly", async () => {
    const userAndBusinessSyncClient = UserAndBusinessSyncClient(
      dynamoUsersDataClient,
      dynamoBusinessesDataClient,
      logger
    );

    jest.spyOn(dynamoUsersDataClient, "getUsersWithOutdatedVersion").mockResolvedValue([userData]);
    jest.spyOn(dynamoUsersDataClient, "put").mockResolvedValue(userData);
    jest.spyOn(dynamoBusinessesDataClient, "put").mockResolvedValue(userData.businesses[userData.user.id]);

    const result = await userAndBusinessSyncClient.migrateUsersAndBusinesses();

    expect(result.success).toBe(true);
    expect(result.migratedCount).toBeGreaterThan(0);
    expect(dynamoBusinessesDataClient.put).toHaveBeenCalledTimes(1);
    const businessId = userData.businesses[userData.currentBusinessId].id;
    expect(dynamoBusinessesDataClient.put).toHaveBeenCalledWith(expect.objectContaining({ id: businessId }));
    expect(logger.LogInfo).toHaveBeenCalledWith(
      expect.stringContaining(`Processed user ${userData.user.id} in the user data table`)
    );
    expect(logger.LogInfo).toHaveBeenCalledWith(
      expect.stringContaining(`Processing business ID ${businessId} for user ${userData.user.id}`)
    );
    expect(logger.LogInfo).toHaveBeenCalledWith(
      expect.stringContaining(`Processed business with ID ${businessId} for user ${userData.user.id}`)
    );
    expect(logger.LogInfo).toHaveBeenCalledWith(expect.stringContaining("Migration complete"));
  });

  it("should log an error when no businesses are found for a user", async () => {
    // const userData = generateUserDataForBusiness(generateBusiness({}));
    userData.businesses = {};

    jest.spyOn(dynamoUsersDataClient, "getUsersWithOutdatedVersion").mockResolvedValueOnce([userData]);

    const userAndBusinessSyncClient = UserAndBusinessSyncClient(
      dynamoUsersDataClient,
      dynamoBusinessesDataClient,
      logger
    );
    await userAndBusinessSyncClient.migrateUsersAndBusinesses();

    expect(logger.LogInfo).toHaveBeenCalledWith(`No businesses found for user ${userData.user.id}`);
    expect(dynamoBusinessesDataClient.put).not.toHaveBeenCalled();
  });

  it("should log an error and rethrow when migration fails", async () => {
    const mockError = new Error("Unexpected failure during migration");

    jest.spyOn(dynamoUsersDataClient, "getUsersWithOutdatedVersion").mockRejectedValue(mockError);

    const userAndBusinessSyncClient = UserAndBusinessSyncClient(
      dynamoUsersDataClient,
      dynamoBusinessesDataClient,
      logger
    );
    const result = await userAndBusinessSyncClient.migrateUsersAndBusinesses();

    expect(result.success).toBe(false);
    expect(result.error).toBe(mockError.message);

    expect(logger.LogError).toHaveBeenCalledWith(
      `MigrateUserVersionsAndCopyBusinessData Failed: ${mockError.message}`
    );

    expect(logger.LogInfo).not.toHaveBeenCalledWith("Successfully migrated business");
  });
});
