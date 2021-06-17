/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  Industry,
  LicenseData,
  LicenseStatus,
  LicenseStatusItem,
  LicenseStatusResult,
  SearchLicenseStatus,
  TaskProgress,
  UserData,
  UserDataClient,
  UserHandler,
} from "../types";
import dayjs from "dayjs";
import { convertIndustryToLicenseType } from "../license-status/convertIndustryToLicenseType";

export const userHandlerFactory = (
  userDataClient: UserDataClient,
  searchLicenseStatus: SearchLicenseStatus
): UserHandler => {
  const get = async (userId: string): Promise<UserData> => {
    let userData = await userDataClient.get(userId);

    if (shouldCheckLicense(userData)) {
      userData = await searchLicenseStatus(
        createSearchCriteria(userData.licenseData!, userData.onboardingData.industry!)
      )
        .then((licenseStatusResult: LicenseStatusResult) => {
          let taskStatus: TaskProgress = "NOT_STARTED";
          if (licenseStatusResult.status === "ACTIVE") {
            taskStatus = "COMPLETED";
          } else if (licenseStatusResult.status === "PENDING") {
            taskStatus = "IN_PROGRESS";
          }

          return update(
            userId,
            createUserDataUpdate({
              userData: userData,
              taskStatus: taskStatus,
              licenseStatus: licenseStatusResult.status,
              items: licenseStatusResult.checklistItems,
            })
          );
        })
        .catch(() => {
          return update(
            userId,
            createUserDataUpdate({
              userData: userData,
              taskStatus: "NOT_STARTED",
              licenseStatus: "UNKNOWN",
              items: [],
            })
          );
        });
    }

    return userData;
  };

  const put = (userData: UserData): Promise<UserData> => {
    return userDataClient.put(userData);
  };

  const update = async (userId: string, update: Partial<UserData>): Promise<UserData> => {
    const userData = await userDataClient.get(userId);
    return put({ ...userData, ...update });
  };

  const shouldCheckLicense = (userData: UserData): boolean =>
    userData.onboardingData.industry !== undefined &&
    userData.licenseData !== undefined &&
    hasBeenMoreThanOneHour(userData.licenseData.lastCheckedStatus);

  const hasBeenMoreThanOneHour = (lastCheckedDate: string): boolean => {
    return dayjs(lastCheckedDate).isBefore(dayjs().subtract(1, "hour"));
  };

  const createUserDataUpdate = (args: {
    userData: UserData;
    taskStatus: TaskProgress;
    licenseStatus: LicenseStatus;
    items: LicenseStatusItem[];
  }): Partial<UserData> => ({
    taskProgress: {
      ...args.userData.taskProgress,
      "apply-for-shop-license": args.taskStatus,
      "register-consumer-affairs": args.taskStatus,
    },
    licenseData: {
      nameAndAddress: args.userData.licenseData!.nameAndAddress,
      completedSearch: args.userData.licenseData!.completedSearch,
      lastCheckedStatus: dayjs().toISOString(),
      status: args.licenseStatus,
      items: args.items,
    },
  });

  const createSearchCriteria = (licenseData: LicenseData, industry: Industry) => ({
    name: licenseData.nameAndAddress.name,
    addressLine1: licenseData.nameAndAddress.addressLine1,
    addressLine2: licenseData.nameAndAddress.addressLine2,
    zipCode: licenseData.nameAndAddress.zipCode,
    licenseType: convertIndustryToLicenseType(industry),
  });

  return { get, put, update };
};
