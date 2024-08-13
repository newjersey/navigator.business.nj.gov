import { formatRegulatedBusinessDynamicsApplications } from "@client/dynamics/license-status/formatRegulatedBusinessDynamicsApplications";
import { DUPLICATE_LICENSE_TYPE_ERROR } from "@client/dynamics/license-status/regulatedBusinessDynamicsLicenseStatusTypes";
import { generateLicenseStatusChecklistResult } from "@test/factories";

describe("formatRegulatedBusinessDynamicsApplications", () => {
  it("formats LicenseChecklistResponse type to LicenseStatusResults type", () => {
    const checklistResult1 = generateLicenseStatusChecklistResult({});
    const checklistResult2 = generateLicenseStatusChecklistResult({});

    expect(formatRegulatedBusinessDynamicsApplications([checklistResult1, checklistResult2])).toEqual({
      [checklistResult1.professionNameAndLicenseType]: {
        licenseStatus: checklistResult1.licenseStatus,
        expirationDateISO: checklistResult1.expirationDateISO,
        checklistItems: checklistResult1.checklistItems,
      },
      [checklistResult2.professionNameAndLicenseType]: {
        licenseStatus: checklistResult2.licenseStatus,
        expirationDateISO: checklistResult2.expirationDateISO,
        checklistItems: checklistResult2.checklistItems,
      },
    });
  });

  it("throws DUPLICATE_LICENSE_TYPE_ERROR error when there is a duplicate professionNameAndLicenseType", () => {
    const checklistResult1 = generateLicenseStatusChecklistResult({
      professionNameAndLicenseType: "duplicate profession name and license type",
    });
    const checklistResult2 = generateLicenseStatusChecklistResult({
      professionNameAndLicenseType: "duplicate profession name and license type",
    });

    expect(() => formatRegulatedBusinessDynamicsApplications([checklistResult1, checklistResult2])).toThrow(
      DUPLICATE_LICENSE_TYPE_ERROR
    );
  });
});
