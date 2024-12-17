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
import { UserData } from "@shared/userData";
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
  const generateUserData = (businessName = "Default Business Name"): UserData => {
    return generateUserDataForBusiness(
      generateBusiness({
        profileData: generateProfileData({
          dateOfFormation: formationDate,
          legalStructureId: "limited-liability-company",
          naicsCode: naicsCode,
          industryId: industry,
          encryptedTaxId: encryptedTaxId,
          businessName: businessName,
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
    jest.spyOn(dynamoUsersDataClient, "getUsersWithOutdatedVersion").mockResolvedValue([userData]);
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

    jest.spyOn(dynamoUsersDataClient, "getUsersWithOutdatedVersion").mockResolvedValueOnce([userData]);

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

  it("should migrate data for multiple users with outdated versions", async () => {
    const userData1 = { ...structuredClone(generateUserData()), version: 140 };
    const userData2 = { ...structuredClone(generateUserData()), version: 143 };
    jest
      .spyOn(dynamoUsersDataClient, "getUsersWithOutdatedVersion")
      .mockResolvedValue([userData1, userData2]);
    const result = await dynamoDataClient.migrateData();

    expect(result.success).toBe(true);
    expect(result.migratedCount).toBe(2);
    expect(dynamoBusinessesDataClient.put).toHaveBeenCalledTimes(2);

    for (const data of [userData1, userData2]) {
      const businessId = data.businesses[data.currentBusinessId].id;
      expect(dynamoBusinessesDataClient.put).toHaveBeenCalledWith(
        expect.objectContaining({ id: businessId })
      );
      expect(logger.LogInfo).toHaveBeenCalledWith(expect.stringContaining(`Updated business ${businessId}`));
    }
  });

  it("should find user by businessName", async () => {
    const businessName = "Test Business Name";
    const userData1 = generateUserData(businessName);
    const userData2 = generateUserData(businessName);
    const userData3 = generateUserData();
    const userData4 = generateUserData("test Business Name");
    const userData5 = generateUserData("test Business Name!");

    jest
      .spyOn(dynamoUsersDataClient, "queryUsersWithBusinesses")
      .mockResolvedValue([userData1, userData2, userData3, userData4, userData5]);

    const result = await dynamoDataClient.findUserByBusinessName(businessName);

    expect(dynamoUsersDataClient.queryUsersWithBusinesses).toHaveBeenCalledTimes(1);
    expect(result).toEqual([userData1, userData2, userData4, userData5]);
  });
});
