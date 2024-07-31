import { inputManipulator } from "@domain/inputManipulator";
import { LicenseStatusClient, NO_MATCH_ERROR, SearchLicenseStatus } from "@domain/types";
import { getLicenseDate, parseDateWithFormat } from "@shared/dateHelpers";
import {
  LicenseSearchNameAndAddress,
  LicenseStatus,
  LicenseStatusItem,
  LicenseStatusResult,
} from "@shared/license";

export const WebserviceLicenseStatusProcessorClient = (
  licenseStatusClient: LicenseStatusClient
): SearchLicenseStatus => {
  return async (
    nameAndAddress: LicenseSearchNameAndAddress,
    licenseType: string
  ): Promise<LicenseStatusResult> => {
    const searchName = inputManipulator(nameAndAddress.name)
      .makeLowerCase()
      .removeBusinessDesignators()
      .trimPunctuation().value;

    const entities = await licenseStatusClient.search(searchName, nameAndAddress.zipCode, licenseType);

    const allMatchingAddressesArray = entities.filter((it) => {
      return cleanAddress(it.addressLine1).startsWith(cleanAddress(nameAndAddress.addressLine1));
    });

    if (allMatchingAddressesArray.length === 0) {
      throw new Error(NO_MATCH_ERROR);
    }

    const match = allMatchingAddressesArray.reduce((a, b) => {
      return getLicenseDate(a) > getLicenseDate(b) ? a : b;
    });

    const items: LicenseStatusItem[] = entities
      .filter((it) => {
        return it.applicationNumber === match.applicationNumber;
      })
      .filter((it) => {
        return it.checkoffStatus === "Unchecked" || it.checkoffStatus === "Completed";
      })
      .map((it) => {
        return {
          title: it.checklistItem,
          status: it.checkoffStatus === "Completed" ? "ACTIVE" : "PENDING",
        };
      });

    const expirationDate =
      match.expirationDate === undefined || match.expirationDate.length < 8
        ? undefined
        : parseDateWithFormat(match.expirationDate, "YYYYMMDD X");
    return {
      status: determineLicenseStatus(match.licenseStatus),
      expirationISO: expirationDate?.toISOString(),
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

export const cleanAddress = (value: string): string => {
  return inputManipulator(value).makeLowerCase().stripPunctuation().stripWhitespace().value;
};
