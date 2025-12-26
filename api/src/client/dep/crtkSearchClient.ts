import type { CRTKSearch } from "@domain/types";
import type { LogWriterType } from "@libs/logWriter";
import { getConfigValue } from "@libs/ssmUtils";
import type { CRTKEntry } from "@shared/crtk";
import axios from "axios";

export const getCRTKConfig = async (): Promise<{ baseUrl: string }> => {
  return {
    baseUrl: await getConfigValue("dep_base_url"),
  };
};

export const CRTKSearchClient = (logWriter: LogWriterType): CRTKSearch => {
  const searchByBusinessName = async (businessName: string): Promise<CRTKEntry[]> => {
    const config = await getCRTKConfig();
    const logId = logWriter.GetId();
    logWriter.LogInfo(`CRTK Search by Business Name - Id:${logId}, Business Name: ${businessName}`);
    return await axios
      .get(`${config.baseUrl}/crtk_by_facility_name?facility=${encodeURIComponent(businessName)}`)
      .then(async (response) => {
        if (response.data.data.length === 0) {
          throw new Error("NOT_FOUND");
        }

        return response.data.data.map((entry: { [x: string]: unknown }) => {
          return {
            businessName: entry["FAC_NAME"] ?? undefined,
            streetAddress: entry["PHYS_ADDR"] ?? undefined,
            city: entry["PHYS_CITY"] ?? undefined,
            state: entry["PHYS_STATE"] ?? undefined,
            zipCode: entry["PHYS_ZIP"] ?? undefined,
            ein: entry["FEIN"] ?? undefined,
            // Additional fields from the API response:
            facilityId: entry["FAC_ID"] ?? undefined,
            sicCode: entry["SIC_CODE"] ?? undefined,
            naicsCode: entry["NAICS_CODE"] ?? undefined,
            description: entry["DESCRIPTION_1"] ?? undefined,
            businessActivity: entry["BUSINESS_ACTIVITY"] ?? undefined,
            type:
              entry[
                "DECODE(FACITS.B_FAC.FAC_TYP,'R','REGULATED','A','ADMINISTRATIVEONLY','E','NAICSEXEMPT','Z','NOFACILITYINNJ','P','PUBLICEMPLOYER',FACITS.B_FAC.FAC_TYP)"
              ] ?? undefined,
            status:
              entry[
                "DECODE(FACITS.B_FAC.FAC_STATUS,'A','ACTIVE','I','INACTIVE','C','CLOSED','O','OUTOFBUSINESS',FACITS.B_FAC.FAC_STATUS)"
              ] ?? undefined,
            eligibility:
              entry[
                "DECODE(FACITS.B_FAC.ELIGIBILITY,'F','EPCRAONLY','X','EXEMPT','Y','CRTK/RPPR',FACITS.B_FAC.ELIGIBILITY)"
              ] ?? undefined,
            userStatus:
              entry[
                "DECODE(FACITS.B_CRTK.USER_STATUS,'U','USER','A','USERABOVE','B','USERBELOW','N','NON-USER','J','N/A',FACITS.B_CRTK.USER_STATUS)"
              ] ?? undefined,
            receivedDate: entry["RCVD"] ?? undefined,
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
    const config = await getCRTKConfig();
    const logId = logWriter.GetId();
    logWriter.LogInfo(
      `CRTK Search by Address - Id:${logId}, Address: ${streetAddress}, Zip: ${zipCode}`,
    );

    return await axios
      .get(
        `${config.baseUrl}/crtk_by_address_and_zipcode?address=${encodeURIComponent(
          streetAddress,
        )}&zip=${encodeURIComponent(zipCode)}`,
      )
      .then(async (response) => {
        if (response.data.data.length === 0) {
          throw new Error("NOT_FOUND");
        }

        return response.data.data.map((entry: { [x: string]: unknown }) => {
          return {
            businessName: entry["FAC_NAME"] ?? undefined,
            streetAddress: entry["PHYS_ADDR"] ?? undefined,
            city: entry["PHYS_CITY"] ?? undefined,
            state: entry["PHYS_STATE"] ?? undefined,
            zipCode: entry["PHYS_ZIP"] ?? undefined,
            ein: entry["FEIN"] ?? undefined,
            facilityId: entry["FAC_ID"] ?? undefined,
            sicCode: entry["SIC_CODE"] ?? undefined,
            naicsCode: entry["NAICS_CODE"] ?? undefined,
            description: entry["DESCRIPTION_1"] ?? undefined,
            businessActivity: entry["BUSINESS_ACTIVITY"] ?? undefined,
            type:
              entry[
                "DECODE(FACITS.B_FAC.FAC_TYP,'R','REGULATED','A','ADMINISTRATIVEONLY','E','NAICSEXEMPT','Z','NOFACILITYINNJ','P','PUBLICEMPLOYER',FACITS.B_FAC.FAC_TYP)"
              ] ?? undefined,
            status:
              entry[
                "DECODE(FACITS.B_FAC.FAC_STATUS,'A','ACTIVE','I','INACTIVE','C','CLOSED','O','OUTOFBUSINESS',FACITS.B_FAC.FAC_STATUS)"
              ] ?? undefined,
            eligibility:
              entry[
                "DECODE(FACITS.B_FAC.ELIGIBILITY,'F','EPCRAONLY','X','EXEMPT','Y','CRTK/RPPR',FACITS.B_FAC.ELIGIBILITY)"
              ] ?? undefined,
            userStatus:
              entry[
                "DECODE(FACITS.B_CRTK.USER_STATUS,'U','USER','A','USERABOVE','B','USERBELOW','N','NON-USER','J','N/A',FACITS.B_CRTK.USER_STATUS)"
              ] ?? undefined,
            receivedDate: entry["RCVD"] ?? undefined,
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
    const config = await getCRTKConfig();
    const logId = logWriter.GetId();
    logWriter.LogInfo(`CRTK Search by EIN - Id:${logId}, EIN: ${ein}`);
    return await axios
      .get(`${config.baseUrl}/crtk_by_fein?fein=${encodeURIComponent(ein)}`)
      .then(async (response) => {
        if (response.data.data.length === 0) {
          throw new Error("NOT_FOUND");
        }

        return response.data.data.map((entry: { [x: string]: unknown }) => {
          return {
            businessName: entry["FACILITY_NAME"] ?? undefined,
            streetAddress: entry["PHYS_ADDR"] ?? undefined,
            city: entry["PHYS_CITY"] ?? undefined,
            state: entry["PHYS_STATE"] ?? undefined,
            zipCode: entry["PHYS_ZIP"] ?? undefined,
            ein: entry["FEIN"] ?? undefined,
            facilityId: entry["FACILITY_ID"] ?? undefined,
            sicCode: entry["SIC_CODE"] ?? undefined,
            naicsCode: entry["NAICS_CODE"] ?? undefined,
            description: entry["DESCRIPTION_1"] ?? undefined,
            businessActivity: entry["BUSINESS_ACTIVITY"] ?? undefined,
            type: entry["TYPE"] ?? undefined,
            status: entry["STATUS"] ?? undefined,
            eligibility: entry["ELGIBILITY"] ?? undefined,
            userStatus: entry["USER_STATUS"] ?? undefined,
            receivedDate: entry["RECEIVED_DATE"] ?? undefined,
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
