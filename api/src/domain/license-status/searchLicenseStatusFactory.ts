import {
  LicenseStatusClient,
  LicenseStatusItem,
  LicenseStatusResult,
  NameAndAddress,
  SearchLicenseStatus,
} from "../types";
import { inputManipulator } from "../inputManipulator";

export const searchLicenseStatusFactory = (licenseStatusClient: LicenseStatusClient): SearchLicenseStatus => {
  return async (nameAndAddress: NameAndAddress, licenseType: string): Promise<LicenseStatusResult> => {
    const searchName = inputManipulator(nameAndAddress.name)
      .makeLowerCase()
      .removeBusinessDesignators()
      .trimPunctuation().value;

    const entities = await licenseStatusClient.search(searchName, nameAndAddress.zipCode, licenseType);

    const match = entities.find(
      (it) =>
        cleanAddress(it.addressLine1).startsWith(cleanAddress(nameAndAddress.addressLine1)) &&
        it.licenseStatus !== "Expired"
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

export const cleanAddress = (value: string): string =>
  inputManipulator(value).makeLowerCase().stripPunctuation().stripWhitespace().value;
