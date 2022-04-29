import { getLicenseDate } from "@shared/dateHelpers";
import { LicenseStatusItem, LicenseStatusResult } from "@shared/license";
import { NameAndAddress } from "@shared/misc";
import { inputManipulator } from "../inputManipulator";
import { LicenseStatusClient, SearchLicenseStatus } from "../types";

export const searchLicenseStatusFactory = (licenseStatusClient: LicenseStatusClient): SearchLicenseStatus => {
  return async (nameAndAddress: NameAndAddress, licenseType: string): Promise<LicenseStatusResult> => {
    const searchName = inputManipulator(nameAndAddress.name)
      .makeLowerCase()
      .removeBusinessDesignators()
      .trimPunctuation().value;

    const entities = await licenseStatusClient.search(searchName, nameAndAddress.zipCode, licenseType);

    const allMatchingAddressesArray = entities.filter((it) =>
      cleanAddress(it.addressLine1).startsWith(cleanAddress(nameAndAddress.addressLine1))
    );

    if (allMatchingAddressesArray.length === 0) {
      return Promise.reject("NO_MATCH");
    }

    const match = allMatchingAddressesArray.reduce((a, b) => (getLicenseDate(a) > getLicenseDate(b) ? a : b));

    const items: readonly LicenseStatusItem[] = entities
      .filter((it) => it.applicationNumber === match.applicationNumber)
      .filter((it) => it.checkoffStatus === "Unchecked" || it.checkoffStatus === "Completed")
      .map((it) => ({
        title: it.checklistItem,
        status: it.checkoffStatus === "Completed" ? "ACTIVE" : "PENDING",
      }));

    return {
      status:
        match.licenseStatus === "Active"
          ? "ACTIVE"
          : match.licenseStatus === "Pending"
          ? "PENDING"
          : match.licenseStatus === "Expired"
          ? "EXPIRED"
          : match.licenseStatus === "Barred"
          ? "BARRED"
          : match.licenseStatus === "Out of Business"
          ? "OUT_OF_BUSINESS"
          : match.licenseStatus === "Reinstatement Pending"
          ? "REINSTATEMENT_PENDING"
          : match.licenseStatus === "Closed"
          ? "CLOSED"
          : match.licenseStatus === "Deleted"
          ? "DELETED"
          : match.licenseStatus === "Denied"
          ? "DENIED"
          : match.licenseStatus === "Voluntary Surrender"
          ? "VOLUNTARY_SURRENDER"
          : match.licenseStatus === "Withdrawn"
          ? "WITHDRAWN"
          : "UNKNOWN",
      checklistItems: items,
    };
  };
};

export const cleanAddress = (value: string): string =>
  inputManipulator(value).makeLowerCase().stripPunctuation().stripWhitespace().value;
