import { getLicenseStatusResultsFromLicenses, licenseDataModifyingFunction } from "@/lib/utils/licenseStatus";
import {
  generateBusiness,
  generateLicenseData,
  generateLicenseDetails,
  generateUserData,
  generateUserDataForBusiness,
  randomElementFromArray,
  taskIdLicenseNameMapping,
} from "@businessnjgovnavigator/shared/";

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

  describe("licenseDataModifyingFunction", () => {
    it("returns a fn that updates the business that was passed in as the argument when invoked", () => {
      // Used variable names that refer to the specific use case to simplify readability
      const currBusinessIdFromUpdateQueue = "id 1";

      const businessFromUpdateQueue = generateBusiness(generateUserData({}), {
        id: currBusinessIdFromUpdateQueue,
        licenseData: undefined,
      });

      const licensesFromDb = {
        [randomElementFromArray(Object.values(taskIdLicenseNameMapping))]: {
          ...generateLicenseDetails({}),
        },
      };
      const userDataFromDb = generateUserDataForBusiness(
        generateBusiness(generateUserData({}), {
          id: currBusinessIdFromUpdateQueue,
          licenseData: generateLicenseData({ licenses: licensesFromDb }),
        })
      );
      const returnedFn = licenseDataModifyingFunction(userDataFromDb, currBusinessIdFromUpdateQueue);

      const result = returnedFn(businessFromUpdateQueue).licenseData!.licenses;
      expect(result).toEqual(licensesFromDb);
    });
  });
});
