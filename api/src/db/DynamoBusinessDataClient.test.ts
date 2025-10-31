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
import { Business } from "@businessnjgovnavigator/shared";

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
  const dateOfFormation = dayjs().subtract(3, "year").add(1, "month").day(1).format("YYYY-MM-DD");
  const naicsCode = "12345";
  const industryId = "test-industry";
  const hashedTaxId = `some-hashed-tax-id-${randomInt()}`;

  const getBusiness = (business: Partial<Business>): Business => {
    return generateBusiness({
      profileData: generateProfileData({
        dateOfFormation,
        entityId: undefined,
        legalStructureId: "limited-liability-company",
        naicsCode,
        industryId,
        hashedTaxId,
      }),
      taxFilingData: generateTaxFilingData({
        filings: [],
      }),
      dateDeletedISO: business.dateDeletedISO,
      version: CURRENT_VERSION,
    });
  };

  const businessData = getBusiness({});

  beforeEach(() => {
    logger = DummyLogWriter;
    client = DynamoDBDocumentClient.from(new DynamoDBClient(config), dynamoDbTranslateConfig);
    dynamoBusinessesDataClient = DynamoBusinessDataClient(client, dbConfig.tableName, logger);
  });

  it("should throw an error when attempting to retrieve a non-existent business by ID", async () => {
    const randomBusinessId = `business-id-${randomInt()}`;

    await expect(dynamoBusinessesDataClient.get(randomBusinessId)).rejects.toEqual(
      new Error(`Business with ID ${randomBusinessId} not found in table ${dbConfig.tableName}`),
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
      await dynamoBusinessesDataClient.findByBusinessName(`some-business-name-${randomInt()}`),
    ).toBeUndefined();
  });

  it("finds a business by the businessName", async () => {
    const businessName = businessData.profileData.businessName;
    await dynamoBusinessesDataClient.put(businessData);
    const expectedValue = await dynamoBusinessesDataClient.findByBusinessName(businessName);
    expect(expectedValue).toBeDefined();
    expect(expectedValue).toEqual(businessData);
  });

  it("finds all businesses by the businessName prefix", async () => {
    await dynamoBusinessesDataClient.put(businessData);
    const prefix = "some-business";
    const expectedValue = await dynamoBusinessesDataClient.findBusinessesByNamePrefix(prefix);
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

  it("finds all businesses by the hashedTaxId", async () => {
    await dynamoBusinessesDataClient.put(businessData);
    let expectedValue = await dynamoBusinessesDataClient.findAllByHashedTaxId(hashedTaxId);
    expect(expectedValue).toHaveLength(1);
    expect(expectedValue[0]).toBeDefined();
    expect(expectedValue[0]).toEqual(businessData);

    const businessWithoutHashedTaxId = generateBusiness({ profileData: generateProfileData({}) });
    await dynamoBusinessesDataClient.put(businessWithoutHashedTaxId);
    expectedValue = await dynamoBusinessesDataClient.findAllByHashedTaxId(hashedTaxId);
    expect(expectedValue).toHaveLength(1);
  });

  it("should return an empty array for a non-existent industry", async () => {
    const randomIndustry = `some-industry-${randomInt()}`;
    expect(await dynamoBusinessesDataClient.findAllByIndustry(randomIndustry)).toHaveLength(0);
  });

  it("finds all businesses by the industry", async () => {
    await dynamoBusinessesDataClient.put(businessData);
    const expectedValue = await dynamoBusinessesDataClient.findAllByIndustry(industryId);
    expect(expectedValue).toHaveLength(1);
    expect(expectedValue[0]).toBeDefined();
    expect(expectedValue[0]).toEqual(businessData);
  });

  it("deletes a business by the ID", async () => {
    const businessId = businessData.id;
    await dynamoBusinessesDataClient.put(businessData);

    const expectedValueBeforeDelete = await dynamoBusinessesDataClient.get(businessId);
    expect(expectedValueBeforeDelete).toBeDefined();
    expect(expectedValueBeforeDelete).toEqual(businessData);

    await dynamoBusinessesDataClient.deleteBusinessById(businessId);
    await expect(dynamoBusinessesDataClient.get(businessId)).rejects.toEqual(
      new Error(`Business with ID ${businessId} not found in table ${dbConfig.tableName}`),
    );
  });

  it("deletes a business when dateExpired ISO is greater than or equal to 30 days later", async () => {
    const businessData = generateBusiness({
      dateDeletedISO: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString(),
    });
    const businessId = businessData.id;
    await dynamoBusinessesDataClient.put(businessData);

    const expectedValueBeforeDelete = await dynamoBusinessesDataClient.get(businessId);
    expect(expectedValueBeforeDelete).toBeDefined();
    expect(expectedValueBeforeDelete).toEqual(businessData);
    expect(expectedValueBeforeDelete.dateDeletedISO).toBeDefined();

    await dynamoBusinessesDataClient.deleteExpiredBusinesses();
    await expect(dynamoBusinessesDataClient.get(businessId)).rejects.toEqual(
      new Error(`Business with ID ${businessId} not found in table ${dbConfig.tableName}`),
    );
  });

  it("does not delete a business when dateExpired ISO is not set", async () => {
    const businessData = generateBusiness({});
    const businessId = businessData.id;
    await dynamoBusinessesDataClient.put(businessData);

    const expectedValueBeforeDelete = await dynamoBusinessesDataClient.get(businessId);
    expect(expectedValueBeforeDelete).toBeDefined();
    expect(expectedValueBeforeDelete).toEqual(businessData);
    expect(expectedValueBeforeDelete.dateDeletedISO).toBeDefined();

    await dynamoBusinessesDataClient.deleteExpiredBusinesses();
    const expectedValue = await dynamoBusinessesDataClient.findByBusinessName(
      businessData.profileData.businessName,
    );
    expect(expectedValue).toEqual(expectedValueBeforeDelete);
  });

  it("does not delete a business when dateExpired ISO is less than 30 days", async () => {
    const businessData = generateBusiness({
      dateDeletedISO: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    });
    const businessId = businessData.id;
    await dynamoBusinessesDataClient.put(businessData);

    const expectedValueBeforeDelete = await dynamoBusinessesDataClient.get(businessId);
    expect(expectedValueBeforeDelete).toBeDefined();
    expect(expectedValueBeforeDelete).toEqual(businessData);
    expect(expectedValueBeforeDelete.dateDeletedISO).toBeDefined();

    await dynamoBusinessesDataClient.deleteExpiredBusinesses();
    const expectedValue = await dynamoBusinessesDataClient.findByBusinessName(
      businessData.profileData.businessName,
    );
    expect(expectedValue).toEqual(expectedValueBeforeDelete);
  });
});
