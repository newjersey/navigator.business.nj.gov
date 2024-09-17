/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { dynamoDbTranslateConfig } from "@db/config/dynamoDbConfig";
import { DynamoBusinessesDataClient } from "@db/DynamoBusinessesDataClient";
import { BusinessesDataClient } from "@domain/types";
import { generateBusiness, generateProfileData, generateTaxFilingData } from "@shared/test";
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
  });

  beforeEach(() => {
    client = DynamoDBDocumentClient.from(new DynamoDBClient(config), dynamoDbTranslateConfig);
    dynamoBusinessesDataClient = DynamoBusinessesDataClient(client, dbConfig.tableName);
  });

  it("inserts and retrieves items from the db", async () => {
    await expect(dynamoBusinessesDataClient.get("some-id")).rejects.toEqual(new Error("Not found"));

    const businessId = businessData.id;
    await dynamoBusinessesDataClient.put(businessData);

    const expectedValue = await dynamoBusinessesDataClient.get(businessId);
    const { version, ...filteredExpectedValue } = expectedValue as unknown as {
      version?: string;
      [key: string]: any;
    };
    expect(filteredExpectedValue).toEqual(businessData);
  });

  it("finds a business by the businessName", async () => {
    expect(
      await dynamoBusinessesDataClient.findByBusinessName("some-business-name-59157929")
    ).toBeUndefined();

    const businessName = businessData.profileData.businessName;
    await dynamoBusinessesDataClient.put(businessData);

    const expectedValue = await dynamoBusinessesDataClient.findByBusinessName(businessName);
    expect(expectedValue).toBeDefined();
    const { version, ...filteredExpectedValue } = expectedValue as unknown as {
      version?: string;
      [key: string]: any;
    };
    expect(filteredExpectedValue).toEqual(businessData);
  });

  it("finds all businesses by the naicsCode", async () => {
    expect(await dynamoBusinessesDataClient.findAllByNAICSCode("some-naicsCode")).toHaveLength(0);
    await dynamoBusinessesDataClient.put(businessData);
    const expectedValue = await dynamoBusinessesDataClient.findAllByNAICSCode(naicsCode);
    expect(expectedValue[0]).toBeDefined();
    const { version, ...filteredExpectedValue } = expectedValue[0] as unknown as {
      version?: string;
      [key: string]: any;
    };
    expect(filteredExpectedValue).toEqual(businessData);
  });

  it("finds all businesses by the industry", async () => {
    expect(await dynamoBusinessesDataClient.findAllByIndustry("some-industry")).toHaveLength(0);

    await dynamoBusinessesDataClient.put(businessData);
    const expectedValue = await dynamoBusinessesDataClient.findAllByIndustry(industry);
    expect(expectedValue[0]).toBeDefined();
    const { version, ...filteredExpectedValue } = expectedValue[0] as unknown as {
      version?: string;
      [key: string]: any;
    };
    expect(filteredExpectedValue).toEqual(businessData);
  });

  it("finds a business by the encryptedId", async () => {
    expect(await dynamoBusinessesDataClient.findByEncryptedTaxId("some-encryptedId")).toBeUndefined();

    await dynamoBusinessesDataClient.put(businessData);
    const expectedValue = await dynamoBusinessesDataClient.findByEncryptedTaxId(encryptedTaxId);
    expect(expectedValue).toBeDefined();
    const { version, ...filteredExpectedValue } = expectedValue as unknown as {
      version?: string;
      [key: string]: any;
    };
    expect(filteredExpectedValue).toEqual(businessData);
  });

  it("deletes a business by the ID", async () => {
    await expect(dynamoBusinessesDataClient.get("some-id")).rejects.toEqual(new Error("Not found"));

    const businessId = businessData.id;
    await dynamoBusinessesDataClient.put(businessData);

    const expectedValueBeforeDelete = await dynamoBusinessesDataClient.get(businessId);
    const { version, ...filteredExpectedValue } = expectedValueBeforeDelete as unknown as {
      version?: string;
      [key: string]: any;
    };

    expect(expectedValueBeforeDelete).toBeDefined();
    expect(filteredExpectedValue).toEqual(businessData);

    await dynamoBusinessesDataClient.deleteBusinessById(businessId);
    await expect(dynamoBusinessesDataClient.get(businessId)).rejects.toEqual(new Error("Not found"));
  });
});
