import {
  Business,
  getLicenseTasksProgress,
  getNonLicenseTasks,
  LicenseName,
  Licenses,
  LicenseStatusResults,
  UserData,
} from "@businessnjgovnavigator/shared/";

export const getLicenseStatusResultsFromLicenses = (licenses: Licenses): LicenseStatusResults => {
  const result: LicenseStatusResults = {};

  for (const [licenseName, details] of Object.entries(licenses)) {
    result[licenseName as LicenseName] = {
      licenseStatus: details.licenseStatus,
      expirationDateISO: details.expirationDateISO,
      checklistItems: details.checklistItems,
    };
  }

  return result;
};

export const licenseDataModifyingFunction = (dbUserData: UserData, currBusinessId: string) => {
  return (business: Business): Business => {
    const licenses = dbUserData?.businesses[currBusinessId]?.licenseData?.licenses || {};
    const licenseStatusResults = getLicenseStatusResultsFromLicenses(licenses);

    return {
      ...business,
      taskProgress: {
        ...getNonLicenseTasks(business),
        ...getLicenseTasksProgress(licenseStatusResults),
      },
      licenseData: dbUserData?.businesses[currBusinessId]?.licenseData,
    };
  };
};
