import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { dynamoDbTranslateConfig } from "@db/config/dynamoDbConfig";
import { DynamoBusinessDataClient } from "@db/DynamoBusinessDataClient";
import { BusinessesDataClient } from "@domain/types";
import { DummyLogWriter, LogWriterType } from "@libs/logWriter";
import { randomInt } from "@shared/intHelpers";
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
    dynamoBusinessesDataClient = DynamoBusinessDataClient(client, dbConfig.tableName, logger);
  });

  it("should throw an error when attempting to retrieve a non-existent business by ID", async () => {
    const randomBusinessId = `business-id-${randomInt()}`;

    await expect(dynamoBusinessesDataClient.get(randomBusinessId)).rejects.toEqual(
      new Error(`Business with ID ${randomBusinessId} not found in table ${dbConfig.tableName}`)
    );
  });

  it("inserts and retrieves items from the db", async () => {
    const businessId = businessData.id;
    await dynamoBusinessesDataClient.put(businessData);

    const expectedValue = await dynamoBusinessesDataClient.get(businessId);
    expect(expectedValue).toEqual(businessData);
  });

  it("should return undefined for a non-existent business name", async () => {
    expect(
      await dynamoBusinessesDataClient.findByBusinessName(`some-business-name-${randomInt()}`)
    ).toBeUndefined();
  });

  it("finds a business by the businessName", async () => {
    const businessName = businessData.profileData.businessName;
    await dynamoBusinessesDataClient.put(businessData);
    const expectedValue = await dynamoBusinessesDataClient.findByBusinessName(businessName);
    expect(expectedValue).toBeDefined();
    expect(expectedValue).toEqual(businessData);
  });

  it("finds all businesses by the businessName", async () => {
    const businessName = businessData.profileData.businessName;
    await dynamoBusinessesDataClient.put(businessData);
    const expectedValue = await dynamoBusinessesDataClient.findAllByBusinessName(businessName);
    expect(expectedValue).toHaveLength(1);
    expect(expectedValue[0]).toBeDefined();
    expect(expectedValue[0]).toEqual(businessData);
  });

  it("should return an empty array for a non-existent NAICS code", async () => {
    const randomNAICSCode = `some-naics-code-${randomInt()}`;
    expect(await dynamoBusinessesDataClient.findAllByNAICSCode(randomNAICSCode)).toHaveLength(0);
  });

  it("finds all businesses by the naicsCode", async () => {
    await dynamoBusinessesDataClient.put(businessData);
    const expectedValue = await dynamoBusinessesDataClient.findAllByNAICSCode(naicsCode);
    expect(expectedValue).toHaveLength(1);
    expect(expectedValue[0]).toBeDefined();
    expect(expectedValue[0]).toEqual(businessData);
  });

  it("should return an empty array for a non-existent industry", async () => {
    const randomIndustry = `some-industry-${randomInt()}`;
    expect(await dynamoBusinessesDataClient.findAllByIndustry(randomIndustry)).toHaveLength(0);
  });

  it("finds all businesses by the industry", async () => {
    await dynamoBusinessesDataClient.put(businessData);
    const expectedValue = await dynamoBusinessesDataClient.findAllByIndustry(industry);
    expect(expectedValue).toHaveLength(1);
    expect(expectedValue[0]).toBeDefined();
    expect(expectedValue[0]).toEqual(businessData);
  });

  it("should return undefined for a non-existent encrypted tax ID", async () => {
    const randomEncryptedTaxId = `some-encryptedId-${randomInt()}`;
    expect(await dynamoBusinessesDataClient.findByEncryptedTaxId(randomEncryptedTaxId)).toBeUndefined();
  });

  it("finds a business by the encryptedId", async () => {
    await dynamoBusinessesDataClient.put(businessData);
    const expectedValue = await dynamoBusinessesDataClient.findByEncryptedTaxId(encryptedTaxId);
    expect(expectedValue).toBeDefined();
    expect(expectedValue).toEqual(businessData);
  });

  it("deletes a business by the ID", async () => {
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
