import {
  generateV8LicenseSearchData,
  generateV8NameAndAddress,
  generateV8OnboardingData,
  generateV8User,
  v8LicenseSearchData,
  v8UserData,
} from "./v8_remove_bcorp";
import { migrate_v8_to_v9 } from "./v9_add_license_status_to_data";

describe("migrate_v8_to_v9", () => {
  const user = generateV8User({});
  const formProgress = "UNSTARTED";
  const taskProgress = {};
  const onboardingData = generateV8OnboardingData({});

  const makeV8 = (licenseSearchData: v8LicenseSearchData | undefined): v8UserData => {
    return { user, onboardingData, formProgress, taskProgress, licenseSearchData, version: 8 };
  };

  describe("when user has no license data", () => {
    const v8 = makeV8(undefined);

    it("continues to be undefined", () => {
      expect(migrate_v8_to_v9(v8)).toEqual({
        user,
        formProgress,
        taskProgress: {},
        onboardingData,
        licenseData: undefined,
        version: 9,
      });
    });
  });

  describe("when license status exists", () => {
    const licenseSearchData = generateV8LicenseSearchData({
      nameAndAddress: generateV8NameAndAddress({}),
      completedSearch: false,
    });
    const v8 = makeV8(licenseSearchData);

    it("adds empty items, status undefined, date epoch and renames licenseData", () => {
      const v9 = migrate_v8_to_v9(v8);
      expect(v9.licenseData?.completedSearch).toEqual(licenseSearchData.completedSearch);
      expect(v9.licenseData?.nameAndAddress).toEqual(licenseSearchData.nameAndAddress);
      expect(v9.licenseData?.status).toEqual("UNKNOWN");
      expect(v9.licenseData?.items).toEqual([]);
      expect(v9.licenseData?.lastCheckedStatus).toEqual("1970-01-01T00:00:00.000Z");
    });
  });
});
