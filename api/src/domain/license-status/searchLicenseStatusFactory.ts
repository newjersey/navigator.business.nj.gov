import {
  LicenseStatusClient,
  LicenseStatusItem,
  LicenseStatusResult,
  NameAndAddress,
  SearchLicenseStatus,
} from "../types";
import { inputManipulator } from "../inputManipulator";
import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';


export const searchLicenseStatusFactory = (licenseStatusClient: LicenseStatusClient): SearchLicenseStatus => {
  return async (nameAndAddress: NameAndAddress, licenseType: string): Promise<LicenseStatusResult> => {
    const searchName = inputManipulator(nameAndAddress.name)
      .makeLowerCase()
      .removeBusinessDesignators()
      .trimPunctuation().value;

    const entities = await licenseStatusClient.search(searchName, nameAndAddress.zipCode, licenseType);
 
    const allMatchingAddressesArray = entities.filter(
      (it) => cleanAddress(it.addressLine1).startsWith(cleanAddress(nameAndAddress.addressLine1))
    )

    const datesArray = allMatchingAddressesArray.map(
      (it) => {
        if (it.issueDate) {
          return dayjs(it.issueDate, "YYYYMMDD X")
        }
        else if (it.dateThisStatus) {
          return dayjs(it.dateThisStatus, "YYYYMMDD X")
        }
        else {
          return dayjs(it.expirationDate, "YYYYMMDD X")
        }
      }
    )

   dayjs.extend(minMax);
    const mostRecentDate = dayjs.max(datesArray);
    
    const match = allMatchingAddressesArray.filter(
      (it) => {
        if (it.issueDate) {
          var d = dayjs(it.issueDate, "YYYYMMDD X")
        }
        else if (it.dateThisStatus) {
          var d = dayjs(it.dateThisStatus, "YYYYMMDD X")
        }
        else {
          var d = dayjs(it.expirationDate, "YYYYMMDD X")
        }
        return d.valueOf() == mostRecentDate.valueOf();
      })[0];


<<<<<<< HEAD
    if (!match) {
      return Promise.reject("NO_MATCH");
=======
  if (!match) {
      return Promise.reject("NO MATCH");
>>>>>>> [#182] show additional license types on license Task screen
    }

    const items: LicenseStatusItem[] = entities
      .filter((it) => it.applicationNumber === match.applicationNumber)
      .filter((it) => it.checkoffStatus === "Unchecked" || it.checkoffStatus === "Completed")
      .map((it) => ({
        title: it.checklistItem,
        status: it.checkoffStatus === "Completed" ? "ACTIVE" : "PENDING",
      }));

    return {
      status: match.licenseStatus === "Active" ? "ACTIVE" 
      : match.licenseStatus === "Pending"  ? "PENDING"
      : match.licenseStatus === "Expired" ? "EXPIRED"
      : match.licenseStatus === "Barred" ? "BARRED"
      : match.licenseStatus === "Out of Business" ? "OUT_OF_BUSINESS"
      : match.licenseStatus === "Reinstatement Pending" ? "REINSTATEMENT_PENDING"
      : match.licenseStatus === "Closed" ? "CLOSED"
      : match.licenseStatus === "Deleted" ? "DELETED"
      : match.licenseStatus === "Denied" ? "DENIED"
      : match.licenseStatus === "Voluntary Surrender" ? "VOLUNTARY_SURRENDER"
      : match.licenseStatus === "Withdrawn" ? "WITHDRAWN"
      : "UNKNOWN",
      checklistItems: items,
    };
  };
};

export const cleanAddress = (value: string): string =>
  inputManipulator(value).makeLowerCase().stripPunctuation().stripWhitespace().value;
