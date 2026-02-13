import type { XrayRegistrationSearch } from "@domain/types";
import type { LogWriterType } from "@libs/logWriter";
import type { XrayRegistrationEntry } from "@shared/xray";
import axios from "axios";

export const XrayRegistrationSearchClient = (
  logWriter: LogWriterType,
  baseUrl: string,
): XrayRegistrationSearch => {
  const searchByAddress = async (
    addressLine1: string,
    addressZipCode: string,
  ): Promise<XrayRegistrationEntry[]> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(
      `Xray Registration Xray Registration Search by Address - Id:${logId}, Address: ${addressLine1}, Zip: ${addressZipCode}`,
    );
    return await axios
      .get(
        `${baseUrl}/xray_by_address?partialaddr=${encodeURIComponent(
          addressLine1,
        )}&zip=${encodeURIComponent(addressZipCode)}`,
      )
      .then(async (response) => {
        if (response.data.data.length === 0) {
          throw new Error("NOT_FOUND");
        }

        return response.data.data.map((entry: { [x: string]: unknown }) => {
          return {
            registrationNumber: entry["REGISTRATION_NUMBER"] ?? undefined,
            roomId: entry["Room ID"] ?? undefined,
            registrationCategory: entry["Registration Category"] ?? undefined,
            name: entry["NAME"] ?? undefined,
            modelNumber: entry["CONSOLE_MODEL#"] ?? undefined,
            serialNumber: entry["CONSOLE_SERIAL#"] ?? undefined,
            annualFee: entry["ANNUAL_FEE"] ?? undefined,
            expirationDate: entry["Registration Expiration Date"] ?? undefined,
            deactivationDate: entry["Deactivation Date"] ?? undefined,
            streetAddress: entry["Street Address"] ?? undefined,
            city: entry["CITY"] ?? undefined,
            state: entry["STATE"] ?? undefined,
            zipCode: entry["Zip Code"] ?? undefined,
            status: entry["Status"] ?? undefined,
            contactType: entry["Contact Type"] ?? undefined,
            disposalDate: entry["Disposal Date"] ?? undefined,
            businessName: entry["BUSINESS_NAME"] ?? undefined,
          };
        });
      })
      .then((entries) => {
        logWriter.LogInfo(
          `Xray Registration Search by Address - Id:${logId} - Success: Returned ${entries.length} entries`,
        );
        return entries;
      })
      .catch((error) => {
        const message = (error as Error).message;
        if (message === "NOT_FOUND") {
          logWriter.LogError(
            `Xray Registration Search by Address - Id:${logId} - Error: No entries found`,
          );
          throw error;
        }
        logWriter.LogError(`Xray Registration Search by Address - Id:${logId} - Error:`, error);
        throw error;
      });
  };

  const searchByBusinessName = async (businessName: string): Promise<XrayRegistrationEntry[]> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(
      `Xray Registration Search by Business Name - Id:${logId}, Business Name: ${businessName}`,
    );
    return await axios
      .get(`${baseUrl}/xray_by_business_name?namepart=${encodeURIComponent(businessName)}`)
      .then(async (response) => {
        if (response.data.data.length === 0) {
          throw new Error("NOT_FOUND");
        }

        return response.data.data.map((entry: { [x: string]: unknown }) => {
          return {
            registrationNumber: entry["REGISTRATION_NUMBER"] ?? undefined,
            roomId: entry["Room ID"] ?? undefined,
            registrationCategory: entry["Registration Category"] ?? undefined,
            name: entry["NAME"] ?? undefined,
            modelNumber: entry["CONSOLE_MODEL#"] ?? undefined,
            serialNumber: entry["CONSOLE_SERIAL#"] ?? undefined,
            annualFee: entry["ANNUAL_FEE"] ?? undefined,
            expirationDate: entry["Registration Expiration Date"] ?? undefined,
            deactivationDate: entry["Deactivation Date"] ?? undefined,
            streetAddress: entry["Street Address"] ?? undefined,
            city: entry["CITY"] ?? undefined,
            state: entry["STATE"] ?? undefined,
            zipCode: entry["Zip Code"] ?? undefined,
            status: entry["Status"] ?? undefined,
            contactType: entry["Contact Type"] ?? undefined,
            disposalDate: entry["Disposal Date"] ?? undefined,
            businessName: entry["BUSINESS_NAME"] ?? undefined,
          };
        });
      })
      .then((entries) => {
        logWriter.LogInfo(
          `Xray Registration Search by Business Name - Id:${logId} - Success: Returned ${entries.length} entries`,
        );
        return entries;
      })
      .catch((error) => {
        const message = (error as Error).message;
        if (message === "NOT_FOUND") {
          logWriter.LogError(
            `Xray Registration Search by Business Name - Id:${logId} - Error: No entries found`,
          );
          throw error;
        }
        logWriter.LogError(
          `Xray Registration Search by Business Name - Id:${logId} - Error:`,
          error,
        );
        throw error;
      });
  };

  return {
    searchByAddress,
    searchByBusinessName,
  };
};
