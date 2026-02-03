import { CrtkData, CrtkEntry } from "@businessnjgovnavigator/shared";
import { CrtkSearch, CrtkStatusLookup } from "@domain/types";
import type { LogWriterType } from "@libs/logWriter";

export const CrtkLookupClient = (
  crtkSearchClient: CrtkSearch,
  logWriter: LogWriterType,
): CrtkStatusLookup => {
  const getStatus = async (
    businessName: string,
    addressLine1: string,
    city: string,
    addressZipCode: string,
    ein?: string,
  ): Promise<CrtkData> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`CRTK Lookup - Id:${logId}`);

    let searchResults: CrtkEntry[] = [];

    try {
      if (ein) {
        logWriter.LogInfo(`CRTK Lookup - Id:${logId} - Searching by EIN: ${ein}`);
        searchResults = await crtkSearchClient.searchByEIN(ein);
      } else {
        let addressResults: CrtkEntry[] = [];
        let businessNameResults: CrtkEntry[] = [];

        addressResults = await crtkSearchClient.searchByAddress(addressLine1, addressZipCode);
        businessNameResults = await crtkSearchClient.searchByBusinessName(businessName);

        const crtkRegisteredBusiness = addressResults.find((addrEntry) =>
          businessNameResults.some(
            (nameEntry) =>
              nameEntry.businessName?.toLowerCase() === addrEntry.businessName?.toLowerCase() &&
              nameEntry.streetAddress?.toLowerCase() === addrEntry.streetAddress?.toLowerCase(),
          ),
        );

        if (crtkRegisteredBusiness) {
          searchResults = [crtkRegisteredBusiness];
        } else if (addressResults.length > 0) {
          searchResults = addressResults;
        } else if (businessNameResults.length > 0) {
          searchResults = businessNameResults;
        }
      }
    } catch (error) {
      const message = (error as Error).message;
      if (message === "NOT_FOUND") {
        logWriter.LogError(`CRTK Lookup - Id:${logId} - Error: No entries found`);
        return {
          crtkSearchResult: "NOT_FOUND",
          crtkBusinessDetails: {
            businessName,
            addressLine1,
            city,
            addressZipCode,
            ein,
          },
          crtkEntry: {},
          lastUpdatedISO: new Date().toISOString(),
        };
      }

      throw error;
    }

    if (searchResults.length === 0) {
      logWriter.LogError(`CRTK Lookup - Id:${logId} - Error: No matching entries found`);
      return {
        crtkSearchResult: "NOT_FOUND",
        crtkBusinessDetails: {
          businessName,
          addressLine1,
          city,
          addressZipCode,
          ein,
        },
        lastUpdatedISO: new Date().toISOString(),
        crtkEntry: {},
      };
    }

    const crtkEntry = searchResults[0];

    const crtkData: CrtkData = {
      lastUpdatedISO: new Date().toISOString(),
      crtkSearchResult: "FOUND",
      crtkBusinessDetails: {
        businessName: crtkEntry.businessName || businessName,
        addressLine1: crtkEntry.streetAddress || addressLine1,
        city: crtkEntry.city || city,
        addressZipCode: crtkEntry.zipCode || addressZipCode,
        ein: crtkEntry.ein || ein,
      },
      crtkEntry: crtkEntry,
    };

    logWriter.LogInfo(
      `CRTK Lookup Results - Id:${logId}, Result: ${crtkData.crtkSearchResult}, Business: ${crtkData.crtkBusinessDetails?.businessName}, EIN: ${ein || "N/A"}`,
    );

    return crtkData;
  };

  return {
    getStatus,
  };
};
