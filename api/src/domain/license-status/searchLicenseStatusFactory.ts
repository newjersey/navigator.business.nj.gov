import {
  LicenseStatusClient,
  LicenseStatusItem,
  LicenseStatusResult,
  NameAndAddress,
  SearchLicenseStatus,
} from "../types";

export const searchLicenseStatusFactory = (licenseStatusClient: LicenseStatusClient): SearchLicenseStatus => {
  return async (nameAndAddress: NameAndAddress, licenseType: string): Promise<LicenseStatusResult> => {
    const entities = await licenseStatusClient.search(
      nameAndAddress.name,
      nameAndAddress.zipCode,
      licenseType
    );

    const match = entities.find(
      (it) => it.addressLine1 === nameAndAddress.addressLine1 && it.licenseStatus !== "Expired"
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
