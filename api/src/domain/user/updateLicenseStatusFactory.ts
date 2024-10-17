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
  enabledLicensesSources,
  LicenseDetails,
  LicenseName,
  Licenses,
  LicenseSearchNameAndAddress,
  LicenseTaskId,
  taskIdLicenseNameMapping,
} from "@shared/license";
import { modifyCurrentBusiness } from "@shared/test";
import { Business, TaskProgress, UserData } from "@shared/userData";

const DEBUG_RegulatedBusinessDynamicsLicenseSearch = false; // this variable exists in RegulatedBusinessDynamicsLicenseStatusClient; enable both for debugging

const getLicenseTasksProgress = (licenseStatusResult: LicenseStatusResults): Record<string, TaskProgress> => {
  const licenseTasksProgress: Record<string, TaskProgress> = {};
  for (const licenseName of Object.keys(licenseStatusResult) as LicenseName[]) {
    const taskId = Object.keys(taskIdLicenseNameMapping).find(
      (taskId) => taskIdLicenseNameMapping[taskId as keyof typeof taskIdLicenseNameMapping] === licenseName
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
  taskIdWithError?: LicenseTaskId;
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
    ? taskIdLicenseNameMapping[args.taskIdWithError]
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
    taskIdWithError?: LicenseTaskId;
  }
): UserData => {
  // TODO: In a future state we need to account for existing license data with address that does not match search query
  return modifyCurrentBusiness(userData, (business: Business): Business => {
    const nonLicenseTasks = Object.fromEntries(
      Object.entries(business.taskProgress).filter(
        ([key]) => !Object.keys(taskIdLicenseNameMapping).includes(key)
      )
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
    taskId?: LicenseTaskId
  ): Promise<UserData> => {
    const webserviceLicenseStatusPromise = webserviceLicenseStatusSearch(nameAndAddress);
    const rgbLicenseStatusPromise = rgbLicenseStatusSearch(nameAndAddress);
    return Promise.allSettled([webserviceLicenseStatusPromise, rgbLicenseStatusPromise])
      .then(([webserviceLicenseStatusResults, rgbLicenseStatusResults]) => {
        const webserviceHasError = webserviceLicenseStatusResults.status === "rejected";
        const webserviceHasInvalidMatch =
          webserviceHasError && [NO_MATCH_ERROR].includes(webserviceLicenseStatusResults.reason.message);
        const rgbHasError = rgbLicenseStatusResults.status === "rejected";
        const rgbHasInvalidMatch =
          rgbHasError &&
          [NO_ADDRESS_MATCH_ERROR, NO_MATCH_ERROR, NO_MAIN_APPS_ERROR].includes(
            rgbLicenseStatusResults.reason.message
          );

        if (DEBUG_RegulatedBusinessDynamicsLicenseSearch) {
          console.log({
            functionName: "updateLicenseStatusFactory",
            webserviceLicenseStatusResults,
            rgbLicenseStatusResults,
          });
        }

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
        if (!webserviceHasError) {
          results = { ...webserviceLicenseStatusResults.value };
        }

        if (!rgbHasError) {
          // NOTE: `results` is a combination of Webservice and RGB data.
          // In the case a license has been migrated to RGB from Webservice, the information from the RGB API should be referenced.
          const licenseNames = Object.keys(rgbLicenseStatusResults.value) as LicenseName[];
          for (const licenseName of licenseNames) {
            const dataSource = enabledLicensesSources[licenseName as keyof typeof enabledLicensesSources];
            if (dataSource === "RGB") {
              results = {
                ...results,
                [licenseName]: rgbLicenseStatusResults.value[licenseName],
              };
            }
          }
        }

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
