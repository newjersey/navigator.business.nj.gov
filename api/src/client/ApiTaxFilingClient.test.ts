/* eslint-disable unicorn/no-null */
import { randomInt } from "@shared/intHelpers";
import { TaxFilingLookUpRequest } from "@shared/taxFiling";
import axios from "axios";

import { TaxFilingClient } from "@domain/types";
import { LogWriter, LogWriterType } from "@libs/logWriter";
import { generateTaxIdAndBusinessName } from "@shared/test";
import { generateTaxFilingDates, generateTaxFilingResult } from "@test/factories";

import {
  ApiTaxFilingClient,
  ApiTaxFilingLookupRequest,
  ApiTaxFilingLookupResponse,
  ApiTaxFilingOnboardingRequest,
  ApiTaxFilingOnboardingResponse,
} from "@client/ApiTaxFilingClient";
import { dateToShortISO } from "@domain/tax-filings/taxIdHelper";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

interface TaxFilingOnboardingRequest extends TaxFilingLookUpRequest {
  email: string;
}

const generateTaxIdAndBusinessNameAndEmail = (
  overrides: Partial<TaxFilingOnboardingRequest>
): TaxFilingOnboardingRequest => {
  return {
    ...generateTaxIdAndBusinessName({}),
    email: `some-email-${randomInt()}@whatever.com`,
    ...overrides,
  };
};

const generateSuccessfulApiTaxFilingLookupResponse = (
  overrides: Partial<ApiTaxFilingLookupResponse>,
  taxCity?: string,
  naicsCode?: string
): ApiTaxFilingLookupResponse => {
  return {
    ApiKey: `some-ApiKey-${randomInt()}`,
    Data: [
      { Name: "taxpayer-id", Value: randomInt(9).toString() },
      { Name: "taxpayer-location", Value: randomInt(3).toString() },
      { Name: "tax-business-name", Value: `Some, Name-${randomInt()}` },
      { Name: "tax-name-control", Value: "Some" },
      { Name: "naics-code", Value: naicsCode ?? randomInt(6).toString() },
      { Name: "tax-city", Value: taxCity ?? `Some-City-${randomInt()}` },
    ],
    Errors: null,
    Results: ["st-50/450", "st-51/451", "nj-927/927-w"].map((Id) => {
      return generateTaxFilingResult({ Id });
    }),
    ...overrides,
  };
};

const generateErroredApiTaxFilingLookupResponse = (
  overrides: Partial<ApiTaxFilingLookupResponse>,
  state: "PENDING" | "FAILED" | "UNREGISTERED"
): ApiTaxFilingLookupResponse => {
  const stateErrorMap = {
    PENDING:
      "There is no specific tax eligibility for this business at the moment but please do come back to check later since we get weekly updates.",
    FAILED: "No matching record found for the business. Please verify your Taxpayer ID and Business Name.",
    UNREGISTERED: "This business has not been onboarded to Gov2Go Tax calendar Service so far",
  };
  return {
    ApiKey: `some-ApiKey-${randomInt()}`,
    Data: null,
    Errors: [
      {
        Error: stateErrorMap[state],
        Field: "Results",
      },
    ],
    Results: null,
    ...overrides,
  };
};

const generateSuccessfulApiTaxFilingOnboardingResponse = (
  overrides: Partial<ApiTaxFilingOnboardingResponse>
): ApiTaxFilingOnboardingResponse => {
  return {
    ApiKey: `some-ApiKey-${randomInt()}`,
    Errors: [],
    Notice: "You are signed up for the Tax Calendar Reminder Service.",
    StatusCode: 200,
    ...overrides,
  };
};

const generateErroredApiTaxFilingOnboardingResponse = (
  overrides: Partial<ApiTaxFilingOnboardingResponse>,
  statusCode: 400 | 500 | number
): ApiTaxFilingOnboardingResponse => {
  return {
    ApiKey: `some-ApiKey-${randomInt()}`,
    Errors:
      statusCode === 400
        ? [
            {
              Error: `some-error-content-${randomInt()}`,
              Field: randomInt() % 2 === 0 ? "Taxpayer ID" : "Business Name",
            },
          ]
        : [],
    Notice: null,
    StatusCode: statusCode as 400 | 500,
    ...overrides,
  };
};

describe("ApiTaxFilingClient", () => {
  let client: TaxFilingClient;
  let logger: LogWriterType;
  let taxIdAndBusinessNameAndEmail: TaxFilingOnboardingRequest;
  const config = { apiKey: "abcdef", baseUrl: "example.com/gov2go" };

  beforeEach(() => {
    jest.resetAllMocks();
    taxIdAndBusinessNameAndEmail = generateTaxIdAndBusinessNameAndEmail({});
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");
    client = ApiTaxFilingClient(config, logger);
  });

  describe("lookup", () => {
    it("posts to the endpoint with the api tax-filing lookup request object", async () => {
      const stubResponse = generateSuccessfulApiTaxFilingLookupResponse({});
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

      await client.lookup({
        taxId: taxIdAndBusinessNameAndEmail.taxId,
        businessName: taxIdAndBusinessNameAndEmail.businessName,
      });
      expect(mockAxios.post).toHaveBeenCalledWith(`${config.baseUrl}/lookup`, postBody);
    });

    it("returns taxFiling data on success", async () => {
      const Results = [
        generateTaxFilingResult({
          Id: "test-id",
          Values: generateTaxFilingDates(1),
        }),
      ];
      const stubResponse = generateSuccessfulApiTaxFilingLookupResponse(
        {
          Results,
        },
        "testville",
        "123456"
      );
      mockAxios.post.mockResolvedValue({ data: stubResponse });
      const response = await client.lookup({
        taxId: taxIdAndBusinessNameAndEmail.taxId,
        businessName: taxIdAndBusinessNameAndEmail.businessName,
      });
      expect(response).toEqual({
        state: "SUCCESS",
        filings: [
          {
            identifier: "test-id",
            dueDate: dateToShortISO(Results[0].Values[0]),
            calendarEventType: "TAX-FILING",
          },
        ],
        taxCity: "testville",
        naicsCode: "123456",
      });
    });

    it("returns only taxFiling state on failure", async () => {
      const stubResponse = generateErroredApiTaxFilingLookupResponse({}, "FAILED");
      mockAxios.post.mockRejectedValue({ response: { data: stubResponse, status: 400 } });
      const response = await client.lookup({
        taxId: taxIdAndBusinessNameAndEmail.taxId,
        businessName: taxIdAndBusinessNameAndEmail.businessName,
      });
      expect(response).toEqual({
        state: "FAILED",
        filings: [],
      });
    });

    it("returns only taxFiling state on pending", async () => {
      const stubResponse = generateErroredApiTaxFilingLookupResponse({}, "PENDING");
      mockAxios.post.mockRejectedValue({ response: { data: stubResponse, status: 400 } });
      const response = await client.lookup({
        taxId: taxIdAndBusinessNameAndEmail.taxId,
        businessName: taxIdAndBusinessNameAndEmail.businessName,
      });
      expect(response).toEqual({
        state: "PENDING",
        filings: [],
      });
    });

    it("returns only taxFiling state on unregistered", async () => {
      const stubResponse = generateErroredApiTaxFilingLookupResponse({}, "UNREGISTERED");
      mockAxios.post.mockRejectedValue({ response: { data: stubResponse, status: 400 } });
      const response = await client.lookup({
        taxId: taxIdAndBusinessNameAndEmail.taxId,
        businessName: taxIdAndBusinessNameAndEmail.businessName,
      });
      expect(response).toEqual({
        state: "UNREGISTERED",
        filings: [],
      });
    });

    it("returns only taxFiling state on api failure", async () => {
      mockAxios.post.mockRejectedValue({});
      const response = await client.lookup({
        taxId: taxIdAndBusinessNameAndEmail.taxId,
        businessName: taxIdAndBusinessNameAndEmail.businessName,
      });
      expect(response).toEqual({
        state: "API_ERROR",
        filings: [],
      });
    });
  });

  describe("onboarding", () => {
    it("posts to the endpoint with the api tax-filing onboarding request object", async () => {
      const stubResponse = generateSuccessfulApiTaxFilingOnboardingResponse({});
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

      await client.onboarding({
        taxId: taxIdAndBusinessNameAndEmail.taxId,
        email: taxIdAndBusinessNameAndEmail.email,
        businessName: taxIdAndBusinessNameAndEmail.businessName,
      });
      expect(mockAxios.post).toHaveBeenCalledWith(`${config.baseUrl}/onboard`, postBody);
    });

    it("returns success state on api success", async () => {
      const stubResponse = generateSuccessfulApiTaxFilingOnboardingResponse({});
      mockAxios.post.mockResolvedValue({ data: stubResponse });
      const response = await client.onboarding({
        taxId: taxIdAndBusinessNameAndEmail.taxId,
        email: taxIdAndBusinessNameAndEmail.email,
        businessName: taxIdAndBusinessNameAndEmail.businessName,
      });
      expect(response).toEqual({ state: "SUCCESS" });
    });

    it("returns failed state on api lookup error with errorField as formFailure when api return Taxpayer ID", async () => {
      const stubResponse = generateErroredApiTaxFilingOnboardingResponse(
        {
          Errors: [{ Error: "some-error-string", Field: "Taxpayer ID" }],
        },
        400
      );
      mockAxios.post.mockRejectedValue({ response: { data: stubResponse, status: 400 } });
      const response = await client.onboarding({
        taxId: taxIdAndBusinessNameAndEmail.taxId,
        email: taxIdAndBusinessNameAndEmail.email,
        businessName: taxIdAndBusinessNameAndEmail.businessName,
      });
      expect(response).toEqual({ state: "FAILED", errorField: "formFailure" });
    });

    it("returns failed state on api lookup error with errorField as businessName when api return Business Name", async () => {
      const stubResponse = generateErroredApiTaxFilingOnboardingResponse(
        {
          Errors: [{ Error: "some-error-string", Field: "Business Name" }],
        },
        400
      );
      mockAxios.post.mockRejectedValue({ response: { data: stubResponse, status: 400 } });
      const response = await client.onboarding({
        taxId: taxIdAndBusinessNameAndEmail.taxId,
        email: taxIdAndBusinessNameAndEmail.email,
        businessName: taxIdAndBusinessNameAndEmail.businessName,
      });
      expect(response).toEqual({ state: "FAILED", errorField: "businessName" });
    });

    it("returns failed state on api unknown statusCode", async () => {
      const stubResponse = generateErroredApiTaxFilingOnboardingResponse({}, 204);
      mockAxios.post.mockResolvedValue({ data: stubResponse });
      const response = await client.onboarding({
        taxId: taxIdAndBusinessNameAndEmail.taxId,
        email: taxIdAndBusinessNameAndEmail.email,
        businessName: taxIdAndBusinessNameAndEmail.businessName,
      });
      expect(response).toEqual({ state: "API_ERROR" });
    });

    it("returns error state on api lookup failure", async () => {
      const stubResponse = generateErroredApiTaxFilingOnboardingResponse({}, 500);
      mockAxios.post.mockRejectedValue({ response: { data: stubResponse, status: 500 } });
      const response = await client.onboarding({
        taxId: taxIdAndBusinessNameAndEmail.taxId,
        email: taxIdAndBusinessNameAndEmail.email,
        businessName: taxIdAndBusinessNameAndEmail.businessName,
      });
      expect(response).toEqual({ state: "API_ERROR" });
    });
  });
});
