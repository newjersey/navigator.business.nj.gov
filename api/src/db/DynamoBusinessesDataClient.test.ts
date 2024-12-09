import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { dynamoDbTranslateConfig } from "@db/config/dynamoDbConfig";
import { DynamoBusinessesDataClient } from "@db/DynamoBusinessesDataClient";
import { BusinessesDataClient } from "@domain/types";
import { DummyLogWriter, LogWriterType } from "@libs/logWriter";
import { generateBusiness, generateProfileData, generateTaxFilingData } from "@shared/test";
import { CURRENT_VERSION } from "@shared/userData";
import dayjs from "dayjs";

// references jest-dynalite-config values
const dbConfig = {
  tableName: "businesses-table-test",
};

describe("DynamoBusinessesDataClient", () => {
  const config = {
    endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
    sslEnabled: false,
    region: "local",
  };

  let client: DynamoDBDocumentClient;
  let dynamoBusinessesDataClient: BusinessesDataClient;
  let logger: LogWriterType;
  const formationDate = dayjs().subtract(3, "year").add(1, "month").day(1).format("YYYY-MM-DD");
  const naicsCode = "12345";
  const industry = "test-industry";
  const encryptedTaxId = "test-id-12345";
  const errorId = "some-id";

  const businessData = generateBusiness({
    profileData: generateProfileData({
      dateOfFormation: formationDate,
      entityId: undefined,
      legalStructureId: "limited-liability-company",
      naicsCode: naicsCode,
      industryId: industry,
      encryptedTaxId: encryptedTaxId,
    }),
    taxFilingData: generateTaxFilingData({
      filings: [],
    }),
    version: CURRENT_VERSION,
  });

  beforeEach(() => {
    logger = DummyLogWriter;
    client = DynamoDBDocumentClient.from(new DynamoDBClient(config), dynamoDbTranslateConfig);
    dynamoBusinessesDataClient = DynamoBusinessesDataClient(client, dbConfig.tableName, logger);
  });

  it("inserts and retrieves items from the db", async () => {
    await expect(dynamoBusinessesDataClient.get(errorId)).rejects.toEqual(
      new Error(`Business with ID ${errorId} not found in table ${dbConfig.tableName}`)
    );

    const businessId = businessData.id;
    await dynamoBusinessesDataClient.put(businessData);

    const expectedValue = await dynamoBusinessesDataClient.get(businessId);
    expect(expectedValue).toEqual(businessData);
  });

  it("finds a business by the businessName", async () => {
    expect(
      await dynamoBusinessesDataClient.findByBusinessName("some-business-name-59157929")
    ).toBeUndefined();

    const businessName = businessData.profileData.businessName;
    await dynamoBusinessesDataClient.put(businessData);

    const expectedValue = await dynamoBusinessesDataClient.findByBusinessName(businessName);
    expect(expectedValue).toBeDefined();
    expect(expectedValue).toEqual(businessData);
  });

  it("finds all businesses by the naicsCode", async () => {
    expect(await dynamoBusinessesDataClient.findAllByNAICSCode("some-naicsCode")).toHaveLength(0);
    await dynamoBusinessesDataClient.put(businessData);
    const expectedValue = await dynamoBusinessesDataClient.findAllByNAICSCode(naicsCode);
    expect(expectedValue).toHaveLength(1);
    expect(expectedValue[0]).toBeDefined();
    expect(expectedValue[0]).toEqual(businessData);
  });

  it("finds all businesses by the industry", async () => {
    expect(await dynamoBusinessesDataClient.findAllByIndustry("some-industry")).toHaveLength(0);

    await dynamoBusinessesDataClient.put(businessData);
    const expectedValue = await dynamoBusinessesDataClient.findAllByIndustry(industry);
    expect(expectedValue).toHaveLength(1);
    expect(expectedValue[0]).toBeDefined();
    expect(expectedValue[0]).toEqual(businessData);
  });

  it("finds a business by the encryptedId", async () => {
    expect(await dynamoBusinessesDataClient.findByEncryptedTaxId("some-encryptedId")).toBeUndefined();

    await dynamoBusinessesDataClient.put(businessData);
    const expectedValue = await dynamoBusinessesDataClient.findByEncryptedTaxId(encryptedTaxId);
    expect(expectedValue).toBeDefined();
    expect(expectedValue).toEqual(businessData);
  });

  it("deletes a business by the ID", async () => {
    await expect(dynamoBusinessesDataClient.get(errorId)).rejects.toEqual(
      new Error(`Business with ID ${errorId} not found in table ${dbConfig.tableName}`)
    );

    const businessId = businessData.id;
    await dynamoBusinessesDataClient.put(businessData);

    const expectedValueBeforeDelete = await dynamoBusinessesDataClient.get(businessId);
    expect(expectedValueBeforeDelete).toBeDefined();
    expect(expectedValueBeforeDelete).toEqual(businessData);

    await dynamoBusinessesDataClient.deleteBusinessById(businessId);
    await expect(dynamoBusinessesDataClient.get(businessId)).rejects.toEqual(
      new Error(`Business with ID ${businessId} not found in table ${dbConfig.tableName}`)
    );
  });
});
