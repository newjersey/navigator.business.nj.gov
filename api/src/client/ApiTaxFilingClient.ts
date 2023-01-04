import axios, { AxiosError } from "axios";
import { flattenDeDupAndConvertTaxFilings } from "../domain/tax-filings/taxIdHelper";
import {
  TaxFilingClient,
  TaxFilingLookupResponse,
  TaxFilingOnboardingResponse,
  TaxFilingResult,
  TaxIdentifierToIdsRecord,
} from "../domain/types";
import { LogWriterType } from "../libs/logWriter";

type ApiConfig = {
  apiKey: string;
  baseUrl: string;
};

export const ApiTaxFilingClient = (config: ApiConfig, logger: LogWriterType): TaxFilingClient => {
  const logId = logger.GetId();

  const taxIdMap: TaxIdentifierToIdsRecord = {
    "cr-1orcnr-11": ["cr-1orcnr-1"],
    "cr-1orcnr-12": ["cr-1orcnr-1"],
  };

  const lookup = async (taxId: string, businessName: string): Promise<TaxFilingLookupResponse> => {
    const postBody: ApiTaxFilingLookupRequest = {
      ApiKey: config.apiKey,
      ServiceName: "Search",
      Data: [
        {
          Name: "taxpayer-id",
          Value: taxId,
        },
        {
          Name: "tax-business-name",
          Value: businessName,
        },
      ],
    };
    logger.LogInfo(
      `TaxFiling Lookup - NICUSA - Id:${logId} - Request Sent to ${
        config.baseUrl
      }/lookup data: ${JSON.stringify(postBody)}`
    );

    try {
      const response = await axios.post(`${config.baseUrl}/lookup`, postBody);

      logger.LogInfo(
        `TaxFiling Lookup - NICUSA - Id:${logId} - Response received: ${JSON.stringify(response.data)}`
      );
      const apiResponse = response.data as ApiTaxFilingLookupResponse;
      return {
        state: "SUCCESS",
        filings: flattenDeDupAndConvertTaxFilings(apiResponse.Results ?? [], taxIdMap),
      };
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 400) {
        const apiResponse = axiosError.response?.data as ApiTaxFilingLookupResponse;
        logger.LogInfo(
          `TaxFiling Lookup - NICUSA - Id:${logId} - Response received: ${JSON.stringify(apiResponse)}`
        );
        if (
          apiResponse.Errors?.some((error) => {
            return error.Error.includes("no specific tax eligibility");
          })
        ) {
          return { state: "PENDING", filings: [] };
        }
        if (
          apiResponse.Errors?.some((error) => {
            return error.Error.includes("not been onboarded");
          })
        ) {
          return { state: "UNREGISTERED", filings: [] };
        }
        if (
          apiResponse.Errors?.some((error) => {
            return error.Error.includes("verify your");
          })
        ) {
          return { state: "FAILED", filings: [] };
        }
        throw error;
      } else {
        logger.LogError(
          `TaxFiling Lookup - NICUSA - Id:${logId} - Unknown error received: ${JSON.stringify(error)}`
        );
        return { state: "API_ERROR", filings: [] };
      }
    }
  };

  const onboarding = async (
    taxId: string,
    email: string,
    businessName: string
  ): Promise<TaxFilingOnboardingResponse> => {
    const postBody: ApiTaxFilingOnboardingRequest = {
      ApiKey: config.apiKey,
      Email: email,
      Items: [
        {
          Data: [
            {
              SchemaFieldSlug: "tax-return-type",
              Value: "tax-calendar-reminder",
            },
            {
              SchemaFieldSlug: "taxpayer-id",
              Value: taxId,
            },
            {
              SchemaFieldSlug: "tax-business-name",
              Value: businessName,
            },
          ],
        },
      ],
    };
    logger.LogInfo(
      `TaxFiling Onboarding - NICUSA - Id:${logId} - Request Sent to ${
        config.baseUrl
      }/onboarding data: ${JSON.stringify(postBody)}`
    );

    try {
      const response = await axios.post(`${config.baseUrl}/onboard`, postBody);

      logger.LogInfo(
        `TaxFiling Onboarding - NICUSA - Id:${logId} - Response received: ${JSON.stringify(response.data)}`
      );

      let apiResponse = response.data;
      if (!apiResponse.errorField) {
        apiResponse = { ...apiResponse, errorField: undefined } as ApiTaxFilingOnboardingResponse;
      } else if (apiResponse.errorField == "Business Name") {
        apiResponse = { ...apiResponse, errorField: "businessName" } as ApiTaxFilingOnboardingResponse;
      } else if (apiResponse.errorField == "Taxpayer Id") {
        apiResponse = { ...apiResponse, errorField: "formFailure" } as ApiTaxFilingOnboardingResponse;
      }
      return apiResponse.StatusCode == 200 ? { state: "SUCCESS" } : { state: "API_ERROR" };
    } catch (error) {
      const axiosError = error as AxiosError;
      const apiResponse = axiosError.response?.data as ApiTaxFilingOnboardingResponse;
      if (axiosError.response?.status === 400) {
        return { state: "FAILED", errorField: apiResponse.Errors[0]?.Field };
      }
      logger.LogError(
        `TaxFiling Onboarding - NICUSA - Id:${logId} - Unknown error received: ${JSON.stringify(error)}`
      );
      return { state: "API_ERROR" };
    }
  };

  return {
    lookup,
    onboarding,
  };
};

export type ApiTaxFilingLookupRequest = {
  ApiKey: string;
  ServiceName: string;
  Data: { Name: "taxpayer-id" | "tax-business-name"; Value: string }[];
};

export type ApiTaxFilingOnboardingRequest = {
  ApiKey: string;
  Email: string;
  Items: {
    Data: {
      SchemaFieldSlug: "tax-return-type" | "taxpayer-id" | "tax-business-name" | "fiscal-month";
      Value: "tax-calendar-reminder" | string;
    }[];
  }[];
};

export type ApiTaxFilingLookupResponse = {
  ApiKey: string;
  Data:
    | {
        Name: "taxpayer-id" | "taxpayer-location" | "tax-business-name" | "tax-name-control";
        Value: string;
      }[]
    | null;
  Errors: { Error: string; Field: string }[] | null;
  Results: TaxFilingResult[] | null;
};

export type ApiTaxFilingOnboardingResponse = {
  ApiKey: string | null;
  Errors: { Error: string; Field: "businessName" | "formFailure" }[];
  Notice: string | null;
  StatusCode: 500 | 400 | 200;
};
