import type { CRTKSearch } from "@domain/types";
import type { LogWriterType } from "@libs/logWriter";
import type { CRTKEntry } from "@shared/crtk";
import axios from "axios";

export const CRTKSearchClient = (logWriter: LogWriterType, baseUrl: string): CRTKSearch => {
  const searchByBusinessName = async (businessName: string): Promise<CRTKEntry[]> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`CRTK Search by Business Name - Id:${logId}, Business Name: ${businessName}`);
    return await axios
      .get(`${baseUrl}/crtk_by_business_name?namepart=${encodeURIComponent(businessName)}`)
      .then(async (response) => {
        if (response.data.data.length === 0) {
          throw new Error("NOT_FOUND");
        }

        return response.data.data.map((entry: { [x: string]: unknown }) => {
          return {
            businessName: entry["BUSINESS_NAME"] ?? undefined,
            streetAddress: entry["STREET_ADDRESS"] ?? undefined,
            city: entry["CITY"] ?? undefined,
            state: entry["STATE"] ?? undefined,
            zipCode: entry["ZIP_CODE"] ?? undefined,
            ein: entry["EIN"] ?? undefined,
            //TODO: other fields returned in response
          };
        });
      })
      .then((entries) => {
        logWriter.LogInfo(
          `CRTK Search by Business Name - Id:${logId} - Success: Returned ${entries.length} entries`,
        );
        return entries;
      })
      .catch((error) => {
        const message = (error as Error).message;
        if (message === "NOT_FOUND") {
          logWriter.LogError(
            `CRTK Search by Business Name - Id:${logId} - Error: No entries found`,
          );
          throw error;
        }
        logWriter.LogError(`CRTK Search by Business Name - Id:${logId} - Error:`, error);
        throw error;
      });
  };

  const searchByAddress = async (streetAddress: string, zipCode: string): Promise<CRTKEntry[]> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(
      `CRTK Search by Address - Id:${logId}, Address: ${streetAddress}, Zip: ${zipCode}`,
    );
    return await axios
      .get(
        `${baseUrl}/crtk_by_address?address=${encodeURIComponent(
          streetAddress,
        )}&zip=${encodeURIComponent(zipCode)}`,
      )
      .then(async (response) => {
        if (response.data.data.length === 0) {
          throw new Error("NOT_FOUND");
        }

        return response.data.data.map((entry: { [x: string]: unknown }) => {
          return {
            businessName: entry["BUSINESS_NAME"] ?? undefined,
            streetAddress: entry["STREET_ADDRESS"] ?? undefined,
            city: entry["CITY"] ?? undefined,
            state: entry["STATE"] ?? undefined,
            zipCode: entry["ZIP_CODE"] ?? undefined,
            ein: entry["EIN"] ?? undefined,
            //TODO: other fields returned in response
          };
        });
      })
      .then((entries) => {
        logWriter.LogInfo(
          `CRTK Search by Address - Id:${logId} - Success: Returned ${entries.length} entries`,
        );
        return entries;
      })
      .catch((error) => {
        const message = (error as Error).message;
        if (message === "NOT_FOUND") {
          logWriter.LogError(`CRTK Search by Address - Id:${logId} - Error: No entries found`);
          throw error;
        }
        logWriter.LogError(`CRTK Search by Address - Id:${logId} - Error:`, error);
        throw error;
      });
  };

  const searchByEIN = async (ein: string): Promise<CRTKEntry[]> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`CRTK Search by EIN - Id:${logId}, EIN: ${ein}`);
    return await axios
      .get(`${baseUrl}/crtk_by_ein?ein=${encodeURIComponent(ein)}`)
      .then(async (response) => {
        if (response.data.data.length === 0) {
          throw new Error("NOT_FOUND");
        }

        return response.data.data.map((entry: { [x: string]: unknown }) => {
          return {
            businessName: entry["BUSINESS_NAME"] ?? undefined,
            streetAddress: entry["STREET_ADDRESS"] ?? undefined,
            city: entry["CITY"] ?? undefined,
            state: entry["STATE"] ?? undefined,
            zipCode: entry["ZIP_CODE"] ?? undefined,
            ein: entry["EIN"] ?? undefined,
            //TODO: other fields returned in response
          };
        });
      })
      .then((entries) => {
        logWriter.LogInfo(
          `CRTK Search by EIN - Id:${logId} - Success: Returned ${entries.length} entries`,
        );
        return entries;
      })
      .catch((error) => {
        const message = (error as Error).message;
        if (message === "NOT_FOUND") {
          logWriter.LogError(`CRTK Search by EIN - Id:${logId} - Error: No entries found`);
          throw error;
        }
        logWriter.LogError(`CRTK Search by EIN - Id:${logId} - Error:`, error);
        throw error;
      });
  };

  return {
    searchByBusinessName,
    searchByAddress,
    searchByEIN,
  };
};
