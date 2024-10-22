import { inputManipulator } from "@domain/inputManipulator";
import { LicenseStatusClient, NO_ADDRESS_MATCH_ERROR, SearchLicenseStatus } from "@domain/types";
import { parseDateWithFormat } from "@shared/dateHelpers";
import { LicenseStatusResults } from "@shared/domain-logic/licenseStatusHelpers";
import {
  LicenseEntity,
  LicenseName,
  LicenseSearchNameAndAddress,
  LicenseStatus,
  LicenseStatusItem,
} from "@shared/license";

export const WebserviceLicenseStatusProcessorClient = (
  licenseStatusClient: LicenseStatusClient
): SearchLicenseStatus => {
  return async (nameAndAddress: LicenseSearchNameAndAddress): Promise<LicenseStatusResults> => {
    const searchName = inputManipulator(nameAndAddress.name)
      .makeLowerCase()
      .removeBusinessDesignators()
      .trimPunctuation().value;

    const licenseStatusClientResults = await licenseStatusClient.search(searchName, nameAndAddress.zipCode);

    const allMatchingAddressesArray = licenseStatusClientResults.filter((it) => {
      return cleanAddress(it.addressLine1).startsWith(cleanAddress(nameAndAddress.addressLine1));
    });

    if (allMatchingAddressesArray.length === 0) {
      throw new Error(NO_ADDRESS_MATCH_ERROR);
    }

    // ASSUMPTION: There will only ever be 1 application of any given combination of professionName and licenseType
    const results: LicenseStatusResults = {};

    for (const checklistItem of allMatchingAddressesArray) {
      const licenseName = `${checklistItem.professionName}-${checklistItem.licenseType}` as LicenseName;
      if (licenseName in results) {
        results[licenseName]!.checklistItems = updateChecklist(
          checklistItem,
          results[licenseName]!.checklistItems
        );
      } else {
        results[licenseName] = {
          licenseStatus: determineLicenseStatus(checklistItem.licenseStatus),
          expirationDateISO: getExpirationDate(checklistItem),
          checklistItems: updateChecklist(checklistItem, []),
        };
      }
    }

    return results;
  };
};

const getExpirationDate = (checklistItem: LicenseEntity): string | undefined => {
  const expirationDate =
    checklistItem.expirationDate === undefined || checklistItem.expirationDate.length < 8
      ? undefined
      : parseDateWithFormat(checklistItem.expirationDate, "YYYYMMDD X").toISOString();

  return expirationDate;
};

const updateChecklist = (
  newChecklistItem: LicenseEntity,
  checklist: LicenseStatusItem[]
): LicenseStatusItem[] => {
  if (newChecklistItem.checkoffStatus === "Unchecked" || newChecklistItem.checkoffStatus === "Completed") {
    checklist.push({
      title: newChecklistItem.checklistItem,
      status: newChecklistItem.checkoffStatus === "Completed" ? "ACTIVE" : "PENDING",
    });
  }
  return checklist;
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
