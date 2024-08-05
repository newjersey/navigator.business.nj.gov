import { LicenseChecklistResponse, LicenseStatusResults } from "@api/types";
import { DUPLICATE_LICENSE_TYPE_ERROR } from "@client/dynamics/license-status/rgbDynamicsLicenseStatusTypes";
import { LicenseName } from "@shared/license";

export const formatDynamicsRgbApplications = (
  applications: LicenseChecklistResponse[]
): LicenseStatusResults => {
  return applications.reduce((result: LicenseStatusResults, app) => {
    if (app.professionNameAndLicenseType in result) {
      throw new Error(DUPLICATE_LICENSE_TYPE_ERROR);
    } else {
      const key = app.professionNameAndLicenseType as LicenseName;
      result[key] = {
        licenseStatus: app.licenseStatus,
        expirationDateISO: app.expirationDateISO,
        checklistItems: app.checklistItems,
      };
    }
    return result;
  }, {});
};
