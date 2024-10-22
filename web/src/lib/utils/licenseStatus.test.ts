import { getLicenseStatusResultsFromLicenses } from "@/lib/utils/licenseStatus";
import { generateLicenseDetails, taskIdLicenseNameMapping } from "@businessnjgovnavigator/shared/";

const licenseNames = Object.values(taskIdLicenseNameMapping);

describe("licenseStatus", () => {
  describe("getLicenseStatusResultsFromLicenseDetails", () => {
    it("returns LicenseStatusResults object from LicenseDetails", () => {
      const licenseDetails1 = generateLicenseDetails({});
      const licenseDetails2 = generateLicenseDetails({});

      const licenseDetails = {
        [licenseNames[0]]: {
          ...licenseDetails1,
        },
        [licenseNames[1]]: {
          ...licenseDetails2,
        },
      };

      expect(getLicenseStatusResultsFromLicenses(licenseDetails)).toStrictEqual({
        [licenseNames[0]]: {
          licenseStatus: licenseDetails1.licenseStatus,
          expirationDateISO: licenseDetails1.expirationDateISO,
          checklistItems: licenseDetails1.checklistItems,
        },
        [licenseNames[1]]: {
          licenseStatus: licenseDetails2.licenseStatus,
          expirationDateISO: licenseDetails2.expirationDateISO,
          checklistItems: licenseDetails2.checklistItems,
        },
      });
    });
  });
});
