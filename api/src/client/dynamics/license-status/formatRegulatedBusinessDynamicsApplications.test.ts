import { formatRegulatedBusinessDynamicsApplications } from "@client/dynamics/license-status/formatRegulatedBusinessDynamicsApplications";
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

  it("returns one license when duplicate checklist results are provided to the fn", () => {
    const checklistResult1 = generateLicenseStatusChecklistResult({});

    expect(formatRegulatedBusinessDynamicsApplications([checklistResult1, checklistResult1])).toEqual({
      [checklistResult1.professionNameAndLicenseType]: {
        licenseStatus: checklistResult1.licenseStatus,
        expirationDateISO: checklistResult1.expirationDateISO,
        checklistItems: checklistResult1.checklistItems,
      },
    });
  });
});
