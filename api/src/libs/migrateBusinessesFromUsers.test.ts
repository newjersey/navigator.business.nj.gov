/* eslint-disable @typescript-eslint/no-explicit-any */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { dynamoDbTranslateConfig } from "@db/config/dynamoDbConfig";
import { DynamoBusinessesDataClient } from "@db/DynamoBusinessesDataClient";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import { BusinessesDataClient, UserDataClient } from "@domain/types";
import { DummyLogWriter, LogWriterType } from "@libs/logWriter";

import { migrateBusinessesFromUsers } from "@libs/migrateBusinessesFromUsers";
import {
  generateBusiness,
  generateProfileData,
  generateTaxFilingData,
  generateUserDataForBusiness,
} from "@shared/test";
import { CURRENT_VERSION } from "@shared/userData";
import dayjs from "dayjs";

// references jest-dynalite-config values
const dbConfig = {
  tableName: "businesses-table-test",
};

const usersDbConfig = {
  tableName: "users-table-test",
};

describe("OneTimeBusinessesMigration", () => {
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
  const naicsCode = "12345";
  const industry = "test-industry";
  const encryptedTaxId = "test-id-12345";
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
  });

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
    process.env.ENABLE_BUSINESS_MIGRATION_FROM_USERS_TABLE = "true";

    (dynamoBusinessesDataClient.put as jest.Mock) = jest.fn();
    (dynamoUsersDataClient.put as jest.Mock) = jest.fn();

    mockLogger();

    jest.spyOn(dynamoBusinessesDataClient, "get").mockImplementation(async (businessId) => {
      return {
        id: businessId,
        version: CURRENT_VERSION,
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
      } as any;
    });

    jest
      .spyOn(dynamoUsersDataClient, "getUsersWithBusinesses")
      .mockImplementation(async (lastEvaluatedKey) => {
        const isSecondPage = lastEvaluatedKey !== undefined;
        const mockUsers = Array.from({ length: 500 }, (_, i) =>
          generateUserDataForBusiness(
            generateBusiness({
              id: `business-${isSecondPage ? i + 500 : i}`,
              profileData: generateProfileData({
                documents: {
                  certifiedDoc: "",
                  formationDoc: "",
                  standingDoc: "",
                },
              }),
            })
          )
        );
        const nextKey = isSecondPage ? undefined : { userId: { S: `user123` } };
        return {
          users: mockUsers,
          lastEvaluatedKey: nextKey,
        };
      });
  });

  it("should migrate businesses from users correctly", async () => {
    jest.setTimeout(60000);
    await migrateBusinessesFromUsers(dynamoUsersDataClient, dynamoBusinessesDataClient, logger);
    expect(dynamoBusinessesDataClient.put).toHaveBeenCalledTimes(1000);
    expect(logger.LogInfo).toHaveBeenCalledWith(expect.stringContaining("Successfully migrated business"));
  });

  it("should log an error when no businesses are found for a user", async () => {
    const userData = generateUserDataForBusiness(generateBusiness({}));
    userData.businesses = {};

    jest.spyOn(dynamoUsersDataClient, "getUsersWithBusinesses").mockResolvedValueOnce({
      users: [userData],
      lastEvaluatedKey: undefined,
    });

    await migrateBusinessesFromUsers(dynamoUsersDataClient, dynamoBusinessesDataClient, logger);
    expect(logger.LogError).toHaveBeenCalledWith(`Businesses not found for user ID: ${userData.user.id}`);
    expect(dynamoBusinessesDataClient.put).not.toHaveBeenCalled();
  });

  it("should log an error and rethrow when migration fails", async () => {
    const mockError = new Error("Unexpected failure during migration");
    jest.spyOn(dynamoUsersDataClient, "getUsersWithBusinesses").mockRejectedValue(mockError);

    await expect(
      migrateBusinessesFromUsers(dynamoUsersDataClient, dynamoBusinessesDataClient, logger)
    ).rejects.toThrow("Migration failed");

    expect(logger.LogError).toHaveBeenCalledWith(`Error during business migration from users:  ${mockError}`);
    expect(logger.LogInfo).not.toHaveBeenCalledWith("Successfully migrated business");
  });
});
