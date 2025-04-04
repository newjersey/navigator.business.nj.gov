import { consolidatedEntries } from "@client/dep/consolidatedEntries";
import { filterByDisposalDate } from "@client/dep/filterByDisposalDate";
import { filterByOwnerType } from "@client/dep/filterByOwnerType";
import { filterByRegistrationNumber } from "@client/dep/filterByRegistrationNumber";
import { LogWriterType } from "@libs/logWriter";
import {
  XrayRegistrationSearch,
  XrayRegistrationStatus,
  XrayRegistrationStatusLookup,
  XrayRegistrationStatusResponse,
} from "@shared/xray";

const getStatusString = (status: string): XrayRegistrationStatus => {
  switch (status) {
    case "Active":
      return "ACTIVE";
    case "Expired":
      return "EXPIRED";
    case "Inactive":
      return "INACTIVE";
    default:
      return "INACTIVE";
  }
};

export const XrayRegistrationLookupClient = (
  xrayRegistrationSearchClient: XrayRegistrationSearch,
  logWriter: LogWriterType
): XrayRegistrationStatusLookup => {
  const getStatus = async (
    businessName: string,
    addressLine1: string,
    addressZipCode: string
  ): Promise<XrayRegistrationStatusResponse> => {
    const logId = logWriter.GetId();
    logWriter.LogInfo(`Xray Registration Lookup - Id:${logId}`);

    let addressResults = await xrayRegistrationSearchClient.searchByAddress(addressLine1, addressZipCode);
    let businessNameResults = await xrayRegistrationSearchClient.searchByBusinessName(businessName);

    // filter by disposal date
    addressResults = filterByDisposalDate(addressResults);
    businessNameResults = filterByDisposalDate(businessNameResults);

    // filter by owner type
    addressResults = filterByOwnerType(addressResults);
    businessNameResults = filterByOwnerType(businessNameResults);

    // filter out duplicate entries
    addressResults = filterByRegistrationNumber(addressResults);
    businessNameResults = filterByRegistrationNumber(businessNameResults);

    // find the overlapping entries
    const consolidatedEntriesResults = consolidatedEntries(addressResults, businessNameResults);

    const consolidatedMachineDetails = [];
    const status = consolidatedEntriesResults[0].status;
    const expirationDate = consolidatedEntriesResults[0].expirationDate ?? undefined;
    const deactivationDate = consolidatedEntriesResults[0].deactivationDate ?? undefined;

    for (const entry in consolidatedEntriesResults) {
      if (status !== consolidatedEntriesResults[entry].status) {
        throw new Error("Lookup failed: status mismatch");
      }
      if (expirationDate !== consolidatedEntriesResults[entry].expirationDate) {
        throw new Error("Lookup failed: expiration mismatch");
      }
      if (deactivationDate !== consolidatedEntriesResults[entry].deactivationDate) {
        throw new Error("Lookup failed: deactivation date mismatch");
      }
      const machineDetails = {
        name: consolidatedEntriesResults[entry].manufacturer,
        registrationNumber: consolidatedEntriesResults[entry].registrationNumber,
        roomId: consolidatedEntriesResults[entry].roomId,
        registrationCategory: consolidatedEntriesResults[entry].registrationCategory,
        manufacturer: consolidatedEntriesResults[entry].manufacturer,
        modelNumber: consolidatedEntriesResults[entry].modelNumber,
        serialNumber: consolidatedEntriesResults[entry].serialNumber,
        annualFee: consolidatedEntriesResults[entry].annualFee,
      };
      consolidatedMachineDetails.push(machineDetails);
    }

    const xrayRegistrationStatusResponse = {
      machines: consolidatedMachineDetails,
      status: getStatusString(status),
      expirationDate,
      deactivationDate,
    };

    logWriter.LogInfo(
      `Xray Registration Lookup Results - Id:${logId}, Status: ${xrayRegistrationStatusResponse.status}, Expiration Date: ${xrayRegistrationStatusResponse.expirationDate},
      Deactivation Date: ${xrayRegistrationStatusResponse.deactivationDate}, Number of Machines: ${xrayRegistrationStatusResponse.machines.length}`
    );

    return xrayRegistrationStatusResponse;
  };

  return {
    getStatus,
  };
};
