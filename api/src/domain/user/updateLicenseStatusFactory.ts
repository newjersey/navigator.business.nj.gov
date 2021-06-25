/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  LicenseStatus,
  LicenseStatusItem,
  LicenseStatusResult,
  NameAndAddress,
  SearchLicenseStatus,
  TaskProgress,
  UpdateLicenseStatus,
  UserData,
  UserDataClient,
} from "../types";
import dayjs from "dayjs";
import { convertIndustryToLicenseType } from "../license-status/convertIndustryToLicenseType";

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
      },
      licenseData: {
        nameAndAddress: args.nameAndAddress,
        completedSearch: args.completed,
        lastCheckedStatus: dayjs().toISOString(),
        status: args.licenseStatus,
        items: args.items,
      },
    };

    return userDataClient.put({ ...args.userData, ...updatedValues });
  };

  return async (userId: string, nameAndAddress: NameAndAddress): Promise<UserData> => {
    const userData = await userDataClient.get(userId);
    const licenseType = convertIndustryToLicenseType(userData.onboardingData.industry);

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
      .catch(() => {
        return update({
          userData: userData,
          nameAndAddress: nameAndAddress,
          taskStatus: "NOT_STARTED",
          licenseStatus: "UNKNOWN",
          items: [],
          completed: false,
        });
      });
  };
};
