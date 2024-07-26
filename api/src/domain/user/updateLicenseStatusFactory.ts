import * as licenseSources from "@client/licenseSources.json";

import { LicenseStatusResults } from "@api/types";
import {
  NO_ADDRESS_MATCH_ERROR,
  NO_MAIN_APPS_ERROR,
  NO_MATCH_ERROR,
  SearchLicenseStatus,
  UpdateLicenseStatus,
} from "@domain/types";
import { getCurrentDateISOString } from "@shared/dateHelpers";
import {
  LicenseDetails,
  LicenseName,
  LicenseSearchNameAndAddress,
  LicenseTaskID,
  Licenses,
  taskIdToLicenseName,
} from "@shared/license";
import { modifyCurrentBusiness } from "@shared/test";
import { Business, TaskProgress, UserData } from "@shared/userData";

const getLicenseTasksProgress = (licenseStatusResult: LicenseStatusResults): Record<string, TaskProgress> => {
  const licenseTasksProgress: Record<string, TaskProgress> = {};
  for (const licenseName of Object.keys(licenseStatusResult) as LicenseName[]) {
    const taskId = Object.keys(taskIdToLicenseName).find(
      (taskId) => taskIdToLicenseName[taskId as keyof typeof taskIdToLicenseName] === licenseName
    );
    let taskStatus: TaskProgress = "NOT_STARTED";
    if (licenseStatusResult[licenseName]!.licenseStatus === "ACTIVE") {
      taskStatus = "COMPLETED";
    } else if (licenseStatusResult[licenseName]!.licenseStatus === "PENDING") {
      taskStatus = "IN_PROGRESS";
    }
    if (taskId !== undefined) licenseTasksProgress[taskId] = taskStatus;
  }

  return licenseTasksProgress;
};

const getLicenses = (args: {
  nameAndAddress: LicenseSearchNameAndAddress;
  licenseStatusResult: LicenseStatusResults;
  taskIdWithError?: LicenseTaskID;
}): Licenses => {
  const results: Licenses = {};
  for (const key of Object.keys(args.licenseStatusResult) as LicenseName[]) {
    results[key] = {
      ...args.licenseStatusResult[key],
      nameAndAddress: args.nameAndAddress,
      lastUpdatedISO: getCurrentDateISOString(),
    } as LicenseDetails;
  }

  const licenseRelatedToCurrentTask = args.taskIdWithError
    ? taskIdToLicenseName[args.taskIdWithError]
    : undefined;

  if (licenseRelatedToCurrentTask && !(licenseRelatedToCurrentTask in results)) {
    results[licenseRelatedToCurrentTask] = {
      nameAndAddress: args.nameAndAddress,
      licenseStatus: "UNKNOWN",
      expirationDateISO: undefined,
      lastUpdatedISO: getCurrentDateISOString(),
      checklistItems: [],
      hasError: true,
    };
  }

  return results;
};

const update = (
  userData: UserData,
  args: {
    nameAndAddress: LicenseSearchNameAndAddress;
    licenseStatusResult: LicenseStatusResults;
    taskIdWithError?: LicenseTaskID;
  }
): UserData => {
  // TODO: In a future state we need to account for existing license data with address that does not match search query
  return modifyCurrentBusiness(userData, (business: Business): Business => {
    const nonLicenseTasks = Object.fromEntries(
      Object.entries(business.taskProgress).filter(([key]) => !Object.keys(taskIdToLicenseName).includes(key))
    );

    return {
      ...business,
      taskProgress: {
        ...nonLicenseTasks,
        ...getLicenseTasksProgress(args.licenseStatusResult),
      },
      licenseData: {
        lastUpdatedISO: getCurrentDateISOString(),
        licenses: getLicenses(args),
      },
    };
  });
};

export const updateLicenseStatusFactory = (
  webserviceLicenseStatusSearch: SearchLicenseStatus,
  rgbLicenseStatusSearch: SearchLicenseStatus
): UpdateLicenseStatus => {
  return async (
    userData: UserData,
    nameAndAddress: LicenseSearchNameAndAddress,
    taskId?: LicenseTaskID
  ): Promise<UserData> => {
    const webserviceLicenseStatusPromise = webserviceLicenseStatusSearch(nameAndAddress);
    const rgbLicenseStatusPromise = rgbLicenseStatusSearch(nameAndAddress);

    return Promise.allSettled([webserviceLicenseStatusPromise, rgbLicenseStatusPromise])
      .then(([webserviceLicenseStatusResults, rgbLicenseStatusResults]) => {
        const webserviceHasError = webserviceLicenseStatusResults.status === "rejected";
        const webserviceHasInvalidMatch =
          webserviceHasError && [NO_MATCH_ERROR].includes(webserviceLicenseStatusResults.reason);
        const rgbHasError = rgbLicenseStatusResults.status === "rejected";
        const rgbHasInvalidMatch =
          rgbHasError &&
          [NO_ADDRESS_MATCH_ERROR, NO_MATCH_ERROR, NO_MAIN_APPS_ERROR].includes(
            rgbLicenseStatusResults.reason
          );

        if (webserviceHasError && rgbHasError) {
          if (webserviceHasInvalidMatch || rgbHasInvalidMatch) {
            return update(userData, {
              nameAndAddress: nameAndAddress,
              licenseStatusResult: {},
              taskIdWithError: taskId,
            });
          }

          if (!webserviceHasInvalidMatch && !rgbHasInvalidMatch) {
            const webserviceErrorMessage = webserviceLicenseStatusResults.reason;
            const rgbErrorMessage = rgbLicenseStatusResults.reason;
            throw new Error(
              JSON.stringify({
                webserviceErrorMessage,
                rgbErrorMessage,
              })
            );
          }
        }

        let results: LicenseStatusResults = {};
        // has a 404, - skipped
        if (!webserviceHasError) {
          results = { ...webserviceLicenseStatusResults.value };
        }

        // success
        if (!rgbHasError) {
          // NOTE: `results` is a combination of Webservice and RGB data.
          // In the case a license has been migrated to RGB from Webservice, the information from the RGB API should be referenced.
          for (const licenseName of Object.keys(rgbLicenseStatusResults.value) as LicenseName[]) {
            const dataSource = licenseSources[licenseName as keyof typeof licenseSources];
            if (dataSource === "RGB") {
              results = {
                ...results,
                [licenseName]: rgbLicenseStatusResults.value[licenseName],
              };
            }
          }
        }

        // update with rgb only
        return update(userData, {
          nameAndAddress: nameAndAddress,
          licenseStatusResult: results,
        });
      })
      .catch((error: Error) => {
        throw error;
      });
  };
};
