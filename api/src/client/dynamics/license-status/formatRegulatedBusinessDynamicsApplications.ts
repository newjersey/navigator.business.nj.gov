import {
  LicenseChecklistResponse,
  LicenseStatusResults,
} from "@shared/domain-logic/licenseStatusHelpers";
import { LicenseName } from "@shared/license";

export const formatRegulatedBusinessDynamicsApplications = (
  applications: LicenseChecklistResponse[],
): LicenseStatusResults => {
  return applications.reduce((result: LicenseStatusResults, app) => {
    const key = app.professionNameAndLicenseType as LicenseName;
    result[key] = {
      licenseStatus: app.licenseStatus,
      expirationDateISO: app.expirationDateISO,
      checklistItems: app.checklistItems,
    };
    return result;
  }, {});
};
