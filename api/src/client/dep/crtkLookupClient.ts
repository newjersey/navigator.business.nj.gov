import type { CRTKSearch, CRTKStatusLookup } from "@domain/types";
import type { LogWriterType } from "@libs/logWriter";
import type { CRTKData, CRTKEntry } from "@shared/crtk";

export const CRTKLookupClient = (
  crtkSearchClient: CRTKSearch,
  logWriter: LogWriterType,
): CRTKStatusLookup => {
  const getStatus = async (
    businessName: string,
    addressLine1: string,
    city: string,
    addressZipCode: string,
    ein?: string,
  ): Promise<CRTKData> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`CRTK Lookup - Id:${logId}`);

    let searchResults: CRTKEntry[] = [];

    try {
      if (ein) {
        logWriter.LogInfo(`CRTK Lookup - Id:${logId} - Searching by EIN: ${ein}`);
        searchResults = await crtkSearchClient.searchByEIN(ein);
      } else {
        let addressResults: CRTKEntry[] = [];
        let businessNameResults: CRTKEntry[] = [];

        addressResults = await crtkSearchClient.searchByAddress(addressLine1, addressZipCode);
        businessNameResults = await crtkSearchClient.searchByBusinessName(businessName);

        const matchingEntry = addressResults.find((addrEntry) =>
          businessNameResults.some(
            (nameEntry) =>
              nameEntry.businessName?.toLowerCase() === addrEntry.businessName?.toLowerCase() &&
              nameEntry.streetAddress?.toLowerCase() === addrEntry.streetAddress?.toLowerCase(),
          ),
        );

        if (matchingEntry) {
          searchResults = [matchingEntry];
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
          CRTKSearchResult: "NOT_FOUND",
          CRTKBusinessDetails: {
            businessName,
            addressLine1,
            city,
            addressZipCode,
          },
          lastUpdatedISO: new Date().toISOString(),
        };
      }
      throw error;
    }

    if (searchResults.length === 0) {
      logWriter.LogError(`CRTK Lookup - Id:${logId} - Error: No matching entries found`);
      return {
        CRTKSearchResult: "NOT_FOUND",
        CRTKBusinessDetails: {
          businessName,
          addressLine1,
          city,
          addressZipCode,
        },
        lastUpdatedISO: new Date().toISOString(),
      };
    }

    // Take the first result (should be only one, especially with EIN)
    const crtkEntry = searchResults[0];

    const crtkData: CRTKData = {
      lastUpdatedISO: new Date().toISOString(),
      CRTKSearchResult: "FOUND",
      CRTKBusinessDetails: {
        businessName: crtkEntry.businessName || businessName,
        addressLine1: crtkEntry.streetAddress || addressLine1,
        city: crtkEntry.city || city,
        addressZipCode: crtkEntry.zipCode || addressZipCode,
      },
    };

    logWriter.LogInfo(
      `CRTK Lookup Results - Id:${logId}, Result: ${crtkData.CRTKSearchResult}, Business: ${crtkData.CRTKBusinessDetails?.businessName}, EIN: ${ein || "N/A"}`,
    );

    return crtkData;
  };

  return {
    getStatus,
  };
};
