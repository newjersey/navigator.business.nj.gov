/* eslint-disable unicorn/no-null */
import { randomInt } from "@shared/intHelpers";
import axios from "axios";

import { generateTaxFilingResults, generateTaxIdAndBusinessNameAndEmail } from "../../test/factories";
import { ApiTaxFilingClient } from "../domain/types";
import { LogWriter, LogWriterType } from "../libs/logWriter";

import { dateToShortISO } from "../domain/tax-filings/taxIdHelper";
import {
  apiTaxFilingClient,
  ApiTaxFilingLookupRequest,
  ApiTaxFilingLookupResponse,
  ApiTaxFilingOnboardingRequest,
  ApiTaxFilingOnboardingResponse,
} from "./ApiTaxFilingClient";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

const generateApiTaxFilingLookupResponse = (
  overrides: Partial<ApiTaxFilingLookupResponse>,
  state: "PENDING" | "SUCCESS" | "FAILED" = "SUCCESS"
): ApiTaxFilingLookupResponse => ({
  ApiKey: `some-ApiKey-${randomInt()}`,
  Data:
    state == "SUCCESS"
      ? [
          { Name: "taxpayer-id", Value: randomInt(9).toString() },
          { Name: "taxpayer-location", Value: randomInt(3).toString() },
          { Name: "tax-business-name", Value: `Some, Name-${randomInt()}` },
          { Name: "tax-name-control", Value: "Some" },
        ]
      : null,
  Errors:
    state != "SUCCESS"
      ? [
          {
            Error:
              state == "PENDING"
                ? "There is no specific tax eligibility for this business at the moment but please do come back to check later since we get weekly updates."
                : "No matching record found for the business. Please verify your Taxpayer ID and Business Name.",
            Field: "Results",
          },
        ]
      : null,
  Results: state == "SUCCESS" ? generateTaxFilingResults() : null,
  ...overrides,
});

const generateApiTaxFilingOnboardingResponse = (
  overrides: Partial<ApiTaxFilingOnboardingResponse>,
  statusCode: 200 | 400 | 500 | number = 200
): ApiTaxFilingOnboardingResponse => {
  return {
    ApiKey: `some-ApiKey-${randomInt()}`,
    Errors:
      statusCode == 400
        ? [
            {
              Error: `some-error-content-${randomInt()}`,
              Field: randomInt() % 2 === 0 ? "Taxpayer ID" : "Business Name",
            },
          ]
        : [],
    Notice: statusCode == 200 ? "You are signed up for the Tax Calendar Reminder Service." : null,
    StatusCode: statusCode as 200 | 400 | 500,
    ...overrides,
  };
};

describe("ApiTaxFilingClient", () => {
  let client: ApiTaxFilingClient;
  let logger: LogWriterType;
  let taxIdAndBusinessNameAndEmail: { businessName: string; taxId: string; email: string };
  const config = { apiKey: "abcdef", baseUrl: "example.com/gov2go" };

  beforeEach(() => {
    jest.resetAllMocks();
    taxIdAndBusinessNameAndEmail = generateTaxIdAndBusinessNameAndEmail({});
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");
    client = apiTaxFilingClient(config, logger);
  });

  describe("lookup", () => {
    it("posts to the endpoint with the api tax-filing lookup request object", async () => {
      const stubResponse = generateApiTaxFilingLookupResponse({});
      mockAxios.post.mockResolvedValue({ data: stubResponse });

      const postBody: ApiTaxFilingLookupRequest = {
        ApiKey: config.apiKey,
        ServiceName: "Search",
        Data: [
          {
            Name: "taxpayer-id",
            Value: taxIdAndBusinessNameAndEmail.taxId,
          },
          {
            Name: "tax-business-name",
            Value: taxIdAndBusinessNameAndEmail.businessName,
          },
        ],
      };

      await client.lookup(taxIdAndBusinessNameAndEmail.taxId, taxIdAndBusinessNameAndEmail.businessName);
      expect(mockAxios.post).toHaveBeenCalledWith(`${config.baseUrl}/lookup`, postBody);
    });

    it("returns taxFiling data on success", async () => {
      const Results = generateTaxFilingResults(["test-id"], 1) ?? [];
      const stubResponse = generateApiTaxFilingLookupResponse({ Results }, "SUCCESS");
      mockAxios.post.mockResolvedValue({ data: stubResponse });
      const response = await client.lookup(
        taxIdAndBusinessNameAndEmail.taxId,
        taxIdAndBusinessNameAndEmail.businessName
      );
      expect(response.state).toEqual("SUCCESS");
      expect(response.filings).toEqual([
        { identifier: "test-id", dueDate: dateToShortISO(Results[0].Values[0]) },
      ]);
    });

    it("returns only taxFiling state on failure", async () => {
      const stubResponse = generateApiTaxFilingLookupResponse({}, "FAILED");
      mockAxios.post.mockRejectedValue({ response: { data: stubResponse, status: 400 } });
      const response = await client.lookup(
        taxIdAndBusinessNameAndEmail.taxId,
        taxIdAndBusinessNameAndEmail.businessName
      );
      expect(response.state).toEqual("FAILED");
      expect(response.filings).toEqual([]);
    });

    it("returns only taxFiling state on pending", async () => {
      const stubResponse = generateApiTaxFilingLookupResponse({}, "PENDING");
      mockAxios.post.mockRejectedValue({ response: { data: stubResponse, status: 400 } });
      const response = await client.lookup(
        taxIdAndBusinessNameAndEmail.taxId,
        taxIdAndBusinessNameAndEmail.businessName
      );
      expect(response.state).toEqual("PENDING");
      expect(response.filings).toEqual([]);
    });

    it("returns only taxFiling state on api failure", async () => {
      mockAxios.post.mockRejectedValue({});
      const response = await client.lookup(
        taxIdAndBusinessNameAndEmail.taxId,
        taxIdAndBusinessNameAndEmail.businessName
      );
      expect(response.state).toEqual("API_ERROR");
      expect(response.filings).toEqual([]);
    });
  });

  describe("onboarding", () => {
    it("posts to the endpoint with the api tax-filing onboarding request object", async () => {
      const stubResponse = generateApiTaxFilingOnboardingResponse({});
      mockAxios.post.mockResolvedValue({ data: stubResponse });

      const postBody: ApiTaxFilingOnboardingRequest = {
        ApiKey: config.apiKey,
        Email: taxIdAndBusinessNameAndEmail.email,
        Items: [
          {
            Data: [
              {
                SchemaFieldSlug: "tax-return-type",
                Value: "tax-calendar-reminder",
              },
              {
                SchemaFieldSlug: "taxpayer-id",
                Value: taxIdAndBusinessNameAndEmail.taxId,
              },
              {
                SchemaFieldSlug: "tax-business-name",
                Value: taxIdAndBusinessNameAndEmail.businessName,
              },
            ],
          },
        ],
      };

      await client.onboarding(
        taxIdAndBusinessNameAndEmail.taxId,
        taxIdAndBusinessNameAndEmail.email,
        taxIdAndBusinessNameAndEmail.businessName
      );
      expect(mockAxios.post).toHaveBeenCalledWith(`${config.baseUrl}/onboard`, postBody);
    });

    it("returns success state on api success", async () => {
      const stubResponse = generateApiTaxFilingOnboardingResponse({}, 200);
      mockAxios.post.mockResolvedValue({ data: stubResponse });
      const response = await client.onboarding(
        taxIdAndBusinessNameAndEmail.taxId,
        taxIdAndBusinessNameAndEmail.email,
        taxIdAndBusinessNameAndEmail.businessName
      );
      expect(response).toEqual({ state: "SUCCESS" });
    });

    it("returns failed state on api lookup error", async () => {
      const stubResponse = generateApiTaxFilingOnboardingResponse({}, 400);
      mockAxios.post.mockRejectedValue({ response: { data: stubResponse, status: 400 } });
      const response = await client.onboarding(
        taxIdAndBusinessNameAndEmail.taxId,
        taxIdAndBusinessNameAndEmail.email,
        taxIdAndBusinessNameAndEmail.businessName
      );
      expect(response).toEqual({ state: "FAILED", errorField: stubResponse.Errors[0].Field });
    });

    it("returns failed state on api unknown statusCode", async () => {
      const stubResponse = generateApiTaxFilingOnboardingResponse({}, 204);
      mockAxios.post.mockResolvedValue({ data: stubResponse });
      const response = await client.onboarding(
        taxIdAndBusinessNameAndEmail.taxId,
        taxIdAndBusinessNameAndEmail.email,
        taxIdAndBusinessNameAndEmail.businessName
      );
      expect(response).toEqual({ state: "API_ERROR" });
    });

    it("returns error state on api lookup failure", async () => {
      const stubResponse = generateApiTaxFilingOnboardingResponse({}, 500);
      mockAxios.post.mockRejectedValue({ response: { data: stubResponse, status: 500 } });
      const response = await client.onboarding(
        taxIdAndBusinessNameAndEmail.taxId,
        taxIdAndBusinessNameAndEmail.email,
        taxIdAndBusinessNameAndEmail.businessName
      );
      expect(response).toEqual({ state: "API_ERROR" });
    });
  });
});
