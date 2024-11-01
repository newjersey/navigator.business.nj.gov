import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { dynamoDbTranslateConfig } from "@db/config/dynamoDbConfig";
import { DynamoBusinessesDataClient } from "@db/DynamoBusinessesDataClient";
import { DynamoUserDataClient } from "@db/DynamoUserDataClient";
import { BusinessesDataClient, UserDataClient } from "@domain/types";
import { DummyLogWriter, LogWriterType } from "@libs/logWriter";
import { usersBusinessesMigration } from "@libs/usersBusinessesMigration";
import {
  generateBusiness,
  generateFormationData,
  generateFormationSubmitResponse,
  generateProfileData,
  generateTaxFilingData,
  generateUserDataForBusiness,
} from "@shared/test";
import { CURRENT_VERSION, UserData } from "@shared/userData";
import { DynamoDBStreamEvent } from "aws-lambda";
import dayjs from "dayjs";

// references jest-dynalite-config values
const dbConfig = {
  tableName: "businesses-table-test",
};

const usersDbConfig = {
  tableName: "users-table-test",
};

describe("UsersBusinessesMigration", () => {
  const config = {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    sslEnabled: false,
    region: "local",
  };

  let client: DynamoDBDocumentClient;
  let dynamoBusinessesDataClient: BusinessesDataClient;
  let logger: LogWriterType;
  let dynamoUsersDataClient: UserDataClient;
  const userId = "test-user-id";
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

  beforeEach(() => {
    logger = DummyLogWriter;
    client = DynamoDBDocumentClient.from(new DynamoDBClient(config), dynamoDbTranslateConfig);
    dynamoBusinessesDataClient = DynamoBusinessesDataClient(client, dbConfig.tableName, logger);
    dynamoUsersDataClient = DynamoUserDataClient(client, usersDbConfig.tableName, logger);
    process.env.ENABLE_BUSINESS_MIGRATION_FROM_USERS_TABLE = "true";
  });

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const mockGetUsersWithBusinesses = (users: UserData[]) => {
    jest.spyOn(dynamoUsersDataClient, "get").mockResolvedValueOnce(users[0]);
  };

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const mockLogger = () => {
    logger.LogInfo = jest.fn();
    logger.LogError = jest.fn();
  };

  it("should migrate businesses from users table when enabled", async () => {
    const userData = generateUserDataForBusiness(
      generateBusiness({
        formationData: generateFormationData({
          formationResponse: generateFormationSubmitResponse({ formationId: "some-formation-id" }),
        }),
        profileData: generateProfileData({
          documents: {
            certifiedDoc: "",
            formationDoc: "",
            standingDoc: "",
          },
        }),
      })
    );
    const event: DynamoDBStreamEvent = {
      Records: [
        {
          eventID: "test-event-id",
          eventName: "INSERT",
          dynamodb: {
            NewImage: {
              userId: { S: userData.user.id },
            },
          },
        },
      ],
    };

    mockGetUsersWithBusinesses([userData]);
    mockLogger();
    dynamoBusinessesDataClient.get = jest.fn().mockImplementation(() => {});
    (dynamoBusinessesDataClient.put as jest.Mock) = jest.fn();
    (dynamoUsersDataClient.put as jest.Mock) = jest.fn();

    await usersBusinessesMigration(event, dynamoUsersDataClient, dynamoBusinessesDataClient, logger);

    const putCalls = (dynamoBusinessesDataClient.put as jest.Mock).mock.calls;
    const businessId = Object.keys(userData.businesses)[0];
    const expectedBusiness = userData.businesses[businessId];

    expect(dynamoBusinessesDataClient.put).toHaveBeenCalledTimes(1);
    expect(putCalls[0][0]).toMatchObject({
      id: expectedBusiness.id,
      version: CURRENT_VERSION,
    });

    expect(logger.LogInfo).toHaveBeenCalledWith(`Processing event INSERT with ID test-event-id`);

    expect(logger.LogInfo).toHaveBeenCalledWith(
      `Successfully migrated business with ID ${businessId} for user ${userData.user.id}`
    );
  });

  it("should log an error if user does not have business data", async () => {
    const event: DynamoDBStreamEvent = {
      Records: [
        {
          eventID: "test-event-id",
          eventName: "INSERT",
          dynamodb: {
            NewImage: {
              userId: { S: userId },
            },
          },
        },
      ],
    };

    dynamoUsersDataClient.get = jest.fn().mockResolvedValue({});
    mockLogger();

    await usersBusinessesMigration(event, dynamoUsersDataClient, dynamoBusinessesDataClient, logger);

    expect(logger.LogError).toHaveBeenCalledWith(`No businesses found for user ${userId}. Skipping.`);
  });

  it("should update the business if it already exists", async () => {
    const businessId = "existing-business-id";
    const userData = generateUserDataForBusiness(
      generateBusiness({ id: businessId, version: CURRENT_VERSION })
    );
    const updatedBusiness = {
      ...userData.businesses[businessId],
      version: CURRENT_VERSION,
    };

    const event: DynamoDBStreamEvent = {
      Records: [
        {
          eventID: "test-event-id",
          eventName: "INSERT",
          dynamodb: {
            NewImage: {
              userId: { S: userData.user.id },
            },
          },
        },
      ],
    };

    mockLogger();
    dynamoUsersDataClient.get = jest
      .fn()
      .mockResolvedValueOnce(userData)
      .mockResolvedValueOnce({
        ...userData,
        businesses: {
          ...userData.businesses,
          [businessId]: updatedBusiness,
        },
      });
    dynamoBusinessesDataClient.get = jest.fn().mockResolvedValue(userData.businesses[businessId]);

    dynamoBusinessesDataClient.put = jest.fn();
    dynamoUsersDataClient.put = jest.fn();

    await usersBusinessesMigration(event, dynamoUsersDataClient, dynamoBusinessesDataClient, logger);

    expect(dynamoBusinessesDataClient.put).toHaveBeenCalledWith(updatedBusiness);

    const newUserData = await dynamoUsersDataClient.get(userData.user.id);
    expect(newUserData.businesses[businessId].version).toEqual(CURRENT_VERSION);

    expect(logger.LogInfo).toHaveBeenCalledWith(
      `Successfully migrated business with ID ${businessId} for user ${userData.user.id}`
    );
    expect(logger.LogError).not.toHaveBeenCalled();
  });

  it("should log an error if there's an exception during migration", async () => {
    const event: DynamoDBStreamEvent = {
      Records: [
        {
          eventID: "test-event-id",
          eventName: "INSERT",
          dynamodb: {
            NewImage: {
              userId: { S: userId },
            },
          },
        },
      ],
    };

    const errorMessage = "Database error";
    dynamoUsersDataClient.get = jest.fn().mockRejectedValue(new Error(errorMessage));
    mockLogger();

    await usersBusinessesMigration(event, dynamoUsersDataClient, dynamoBusinessesDataClient, logger);

    expect(logger.LogError).toHaveBeenCalledWith(
      `Error processing DynamoDB event for user ${userId}: Error: ${errorMessage}`
    );
  });
});
