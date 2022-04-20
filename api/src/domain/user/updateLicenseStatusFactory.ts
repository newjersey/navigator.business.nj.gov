/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getCurrentDateISOString } from "@shared/dateHelpers";
import { LicenseStatus, LicenseStatusItem, LicenseStatusResult } from "@shared/license";
import { NameAndAddress } from "@shared/misc";
import { TaskProgress, UserData } from "@shared/userData";
import { convertIndustryToLicenseType } from "../license-status/convertIndustryToLicenseType";
import { SearchLicenseStatus, UpdateLicenseStatus, UserDataClient } from "../types";

export const updateLicenseStatusFactory = (
  userDataClient: UserDataClient,
  searchLicenseStatus: SearchLicenseStatus
): UpdateLicenseStatus => {
  const update = (args: {
    userData: UserData;
    nameAndAddress: NameAndAddress;
    taskStatus: TaskProgress;
    licenseStatus: LicenseStatus;
    items: LicenseStatusItem[];
    completed: boolean;
  }): Promise<UserData> => {
    const updatedValues = {
      taskProgress: {
        ...args.userData.taskProgress,
        "apply-for-shop-license": args.taskStatus,
        "register-consumer-affairs": args.taskStatus,
        "pharmacy-license": args.taskStatus,
        "license-accounting": args.taskStatus,
        "license-massage-therapy": args.taskStatus,
      },
      licenseData: {
        nameAndAddress: args.nameAndAddress,
        completedSearch: args.completed,
        lastCheckedStatus: getCurrentDateISOString(),
        status: args.licenseStatus,
        items: args.items,
      },
    };

    return userDataClient.put({ ...args.userData, ...updatedValues });
  };

  return async (userId: string, nameAndAddress: NameAndAddress): Promise<UserData> => {
    const userData = await userDataClient.get(userId);
    const licenseType = convertIndustryToLicenseType(userData.profileData.industryId);

    return searchLicenseStatus(nameAndAddress, licenseType)
      .then((licenseStatusResult: LicenseStatusResult) => {
        let taskStatus: TaskProgress = "NOT_STARTED";
        if (licenseStatusResult.status === "ACTIVE") {
          taskStatus = "COMPLETED";
        } else if (licenseStatusResult.status === "PENDING") {
          taskStatus = "IN_PROGRESS";
        }

        return update({
          userData: userData,
          nameAndAddress: nameAndAddress,
          taskStatus: taskStatus,
          licenseStatus: licenseStatusResult.status,
          items: licenseStatusResult.checklistItems,
          completed: true,
        });
      })
      .catch(async (error) => {
        if (error === "NO_MATCH") {
          return update({
            userData: userData,
            nameAndAddress: nameAndAddress,
            taskStatus: "NOT_STARTED",
            licenseStatus: "UNKNOWN",
            items: [],
            completed: false,
          });
        } else {
          await update({
            userData: userData,
            nameAndAddress: nameAndAddress,
            taskStatus: "NOT_STARTED",
            licenseStatus: "UNKNOWN",
            items: [],
            completed: false,
          });
          return Promise.reject(error);
        }
      });
  };
};
