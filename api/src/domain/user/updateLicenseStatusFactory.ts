/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { getCurrentDateISOString } from "@shared/dateHelpers";
import { LicenseStatusResult, NameAndAddress } from "@shared/license";
import { TaskProgress, UserData } from "@shared/userData";
import { convertIndustryToLicenseType } from "../license-status/convertIndustryToLicenseType";
import { SearchLicenseStatus, UpdateLicenseStatus } from "../types";

const update = (
  userData: UserData,
  args: {
    nameAndAddress: NameAndAddress;
    taskStatus: TaskProgress;
    licenseStatusResult: LicenseStatusResult;
    completed: boolean;
  }
): UserData => {
  const updatedValues = {
    taskProgress: {
      ...userData.taskProgress,
      "apply-for-shop-license": args.taskStatus,
      "register-consumer-affairs": args.taskStatus,
      "pharmacy-license": args.taskStatus,
      "license-accounting": args.taskStatus,
      "license-massage-therapy": args.taskStatus,
      "moving-company-license": args.taskStatus,
      "architect-license": args.taskStatus,
      "hvac-license": args.taskStatus,
      "appraiser-license": args.taskStatus,
    },
    licenseData: {
      nameAndAddress: args.nameAndAddress,
      completedSearch: args.completed,
      expirationISO: args.licenseStatusResult.expirationISO,
      lastUpdatedISO: getCurrentDateISOString(),
      status: args.licenseStatusResult.status,
      items: args.licenseStatusResult.checklistItems,
    },
  };

  return { ...userData, ...updatedValues };
};

export const updateLicenseStatusFactory = (searchLicenseStatus: SearchLicenseStatus): UpdateLicenseStatus => {
  return async (userData: UserData, nameAndAddress: NameAndAddress): Promise<UserData> => {
    const licenseType = convertIndustryToLicenseType(userData.profileData.industryId);
    return searchLicenseStatus(nameAndAddress, licenseType)
      .then((licenseStatusResult: LicenseStatusResult) => {
        let taskStatus: TaskProgress = "NOT_STARTED";
        if (licenseStatusResult.status === "ACTIVE") {
          taskStatus = "COMPLETED";
        } else if (licenseStatusResult.status === "PENDING") {
          taskStatus = "IN_PROGRESS";
        }

        return update(userData, {
          nameAndAddress: nameAndAddress,
          taskStatus: taskStatus,
          licenseStatusResult: licenseStatusResult,
          completed: true,
        });
      })
      .catch(async (error) => {
        if (error === "NO_MATCH") {
          return update(userData, {
            nameAndAddress: nameAndAddress,
            taskStatus: "NOT_STARTED",
            licenseStatusResult: { status: "UNKNOWN", checklistItems: [] },
            completed: false,
          });
        } else {
          throw error;
        }
      });
  };
};
