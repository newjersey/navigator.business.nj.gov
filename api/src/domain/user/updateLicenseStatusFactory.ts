/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { convertIndustryToLicenseType } from "@domain/license-status/convertIndustryToLicenseType";
import {
  NO_MAIN_APPS_ERROR,
  NO_MATCH_ERROR,
  SearchLicenseStatusFactory,
  UpdateLicenseStatus,
} from "@domain/types";
import { getCurrentDateISOString } from "@shared/dateHelpers";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import { LicenseSearchNameAndAddress, LicenseStatusResult } from "@shared/license";
import { modifyCurrentBusiness } from "@shared/test";
import { TaskProgress, UserData } from "@shared/userData";

const update = (
  userData: UserData,
  args: {
    nameAndAddress: LicenseSearchNameAndAddress;
    taskStatus: TaskProgress;
    licenseStatusResult: LicenseStatusResult;
    completed: boolean;
  }
): UserData => {
  return modifyCurrentBusiness(userData, (business) => ({
    ...business,
    taskProgress: {
      ...business.taskProgress,
      "apply-for-shop-license": args.taskStatus,
      "register-consumer-affairs": args.taskStatus,
      "pharmacy-license": args.taskStatus,
      "register-accounting-firm": args.taskStatus,
      "public-accountant-license": args.taskStatus,
      "license-massage-therapy": args.taskStatus,
      "moving-company-license": args.taskStatus,
      "architect-license": args.taskStatus,
      "hvac-license": args.taskStatus,
      "appraiser-license": args.taskStatus,
      "landscape-architect-license": args.taskStatus,
      "health-club-registration": args.taskStatus,
    },
    licenseData: {
      nameAndAddress: args.nameAndAddress,
      completedSearch: args.completed,
      expirationISO: args.licenseStatusResult.expirationISO,
      lastUpdatedISO: getCurrentDateISOString(),
      status: args.licenseStatusResult.status,
      items: args.licenseStatusResult.checklistItems,
    },
  }));
};

export const updateLicenseStatusFactory = (
  searchLicenseStatusFactory: SearchLicenseStatusFactory
): UpdateLicenseStatus => {
  return async (userData: UserData, nameAndAddress: LicenseSearchNameAndAddress): Promise<UserData> => {
    const licenseType = convertIndustryToLicenseType(getCurrentBusiness(userData).profileData.industryId);
    const searchLicenseStatus = searchLicenseStatusFactory(licenseType);
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
      .catch(async (error: Error) => {
        if (error.message === NO_MATCH_ERROR || error.message === NO_MAIN_APPS_ERROR) {
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
