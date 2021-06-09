import {
  LicenseSearchCriteria,
  LicenseStatusClient,
  LicenseStatusItem,
  LicenseStatusResult,
  SearchLicenseStatus,
} from "../types";

export const searchLicenseStatusFactory = (licenseStatusClient: LicenseStatusClient): SearchLicenseStatus => {
  return async (searchCriteria: LicenseSearchCriteria): Promise<LicenseStatusResult> => {
    const entities = await licenseStatusClient.search(
      searchCriteria.name,
      searchCriteria.zipCode,
      searchCriteria.licenseType
    );

    const match = entities.find(
      (it) => it.addressLine1 === searchCriteria.addressLine1 && it.licenseStatus !== "Expired"
    );

    if (!match) {
      return Promise.reject("NO MATCH");
    }

    const items: LicenseStatusItem[] = entities
      .filter((it) => it.applicationNumber === match.applicationNumber)
      .filter((it) => it.checkoffStatus === "Unchecked" || it.checkoffStatus === "Completed")
      .map((it) => ({
        title: it.checklistItem,
        status: it.checkoffStatus === "Completed" ? "ACTIVE" : "PENDING",
      }));

    return {
      status: match.licenseStatus === "Active" ? "ACTIVE" : "PENDING",
      checklistItems: items,
    };
  };
};
