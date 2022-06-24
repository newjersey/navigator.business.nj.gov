import { getLicenseDate } from "@shared/dateHelpers";
import { LicenseStatus, LicenseStatusItem, LicenseStatusResult } from "@shared/license";
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
      throw "NO_MATCH";
    }

    const match = allMatchingAddressesArray.reduce((a, b) => (getLicenseDate(a) > getLicenseDate(b) ? a : b));

    const items: LicenseStatusItem[] = entities
      .filter((it) => it.applicationNumber === match.applicationNumber)
      .filter((it) => it.checkoffStatus === "Unchecked" || it.checkoffStatus === "Completed")
      .map((it) => ({
        title: it.checklistItem,
        status: it.checkoffStatus === "Completed" ? "ACTIVE" : "PENDING",
      }));

    return {
      status: determineLicenseStatus(match.licenseStatus),
      checklistItems: items,
    };
  };
};

export const determineLicenseStatus = (value: string): LicenseStatus => {
  switch (value) {
    case "Active":
      return "ACTIVE";
    case "Pending":
      return "PENDING";
    case "Expired":
      return "EXPIRED";
    case "Barred":
      return "BARRED";
    case "Out of Business":
      return "OUT_OF_BUSINESS";
    case "Reinstatement Pending":
      return "REINSTATEMENT_PENDING";
    case "Closed":
      return "CLOSED";
    case "Deleted":
      return "DELETED";
    case "Denied":
      return "DENIED";
    case "Voluntary Surrender":
      return "VOLUNTARY_SURRENDER";
    case "Withdrawn":
      return "WITHDRAWN";
    default:
      return "UNKNOWN";
  }
};

export const cleanAddress = (value: string): string =>
  inputManipulator(value).makeLowerCase().stripPunctuation().stripWhitespace().value;
