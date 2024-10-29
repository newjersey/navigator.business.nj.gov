import {
  NO_ADDRESS_MATCH_ERROR,
  NO_MAIN_APPS_ERROR,
  NO_MATCH_ERROR,
  SearchLicenseStatus,
  UpdateLicenseStatus,
} from "@domain/types";
import { getCurrentDateISOString } from "@shared/dateHelpers";
import { modifyCurrentBusiness } from "@shared/domain-logic/modifyCurrentBusiness";
import {
  enabledLicensesSources,
  LicenseDetails,
  LicenseName,
  Licenses,
  LicenseSearchNameAndAddress,
  LicenseTaskId,
  taskIdLicenseNameMapping,
} from "@shared/license";
import { Business, UserData } from "@shared/userData";

const DEBUG_RegulatedBusinessDynamicsLicenseSearch = false; // this variable exists in RegulatedBusinessDynamicsLicenseStatusClient; enable both for debugging

const getLicenses = (args: {
  nameAndAddress: LicenseSearchNameAndAddress;
  licenseStatusResult: LicenseStatusResults;
}): Licenses => {
  const results: Licenses = {};
  for (const key of Object.keys(args.licenseStatusResult) as LicenseName[]) {
    results[key] = {
      ...args.licenseStatusResult[key],
      nameAndAddress: args.nameAndAddress,
      lastUpdatedISO: getCurrentDateISOString(),
    } as LicenseDetails;
  }

  return results;
};

const updateLicenseStatusAndLicenseTask = (
  userData: UserData,
  args: {
    nameAndAddress: LicenseSearchNameAndAddress;
    licenseStatusResult: LicenseStatusResults;
  }
): UserData => {
  // TODO: In a future state we need to account for existing license data with address that does not match search query
  return modifyCurrentBusiness(userData, (business: Business): Business => {
    return {
      ...business,
      taskProgress: {
        ...getNonLicenseTasks(business),
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
    nameAndAddress: LicenseSearchNameAndAddress
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
            return updateLicenseStatusAndLicenseTask(userData, {
              nameAndAddress: nameAndAddress,
              licenseStatusResult: {},
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

        return updateLicenseStatusAndLicenseTask(userData, {
          nameAndAddress: nameAndAddress,
          licenseStatusResult: results,
        });
      })
      .catch((error: Error) => {
        throw error;
      });
  };
};
