import { formatDynamicsRgbApplications } from "@client/dynamics/license-status/formatDynamicsRgbApplications";
import { DUPLICATE_LICENSE_TYPE_ERROR } from "@client/dynamics/license-status/rgbDynamicsLicenseStatusTypes";
import { generateLicenseStatusChecklistResult } from "@test/factories";

describe("formatDynamicsRgbApplications", () => {
  it("formats LicenseChecklistResponse type to LicenseStatusResults type", () => {
    const checklistResult1 = generateLicenseStatusChecklistResult({});
    const checklistResult2 = generateLicenseStatusChecklistResult({});

    expect(formatDynamicsRgbApplications([checklistResult1, checklistResult2])).toEqual({
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

    expect(() => formatDynamicsRgbApplications([checklistResult1, checklistResult2])).toThrow(
      DUPLICATE_LICENSE_TYPE_ERROR
    );
  });
});
