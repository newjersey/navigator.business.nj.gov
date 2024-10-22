import { isLicenseDataFromDatabaseDataMoreRecent } from "@/lib/domain-logic/isLicenseDataFromDatabaseDataMoreRecent";
import { generateBusiness, generateLicenseData, getCurrentDate } from "@businessnjgovnavigator/shared/";

const currentDate = getCurrentDate();
const currentDateISOString = currentDate.toISOString();
const currentDatePlusOneHourISOString = currentDate.add(1, "hour").toISOString();

describe("isLicenseDataFromDatabaseDataMoreRecent", () => {
  it("returns true when license data is undefined in businessFromDb but defined in businessFromUpdateQueue", () => {
    const result = isLicenseDataFromDatabaseDataMoreRecent({
      businessFromDb: generateBusiness({ licenseData: undefined }),
      businessFromUpdateQueue: generateBusiness({}),
    });

    expect(result).toBeTruthy();
  });

  it("returns true when licence data from businessFromUpdateQueue is not defined but licence data from businessFromDb is", () => {
    const result = isLicenseDataFromDatabaseDataMoreRecent({
      businessFromDb: generateBusiness({}),
      businessFromUpdateQueue: generateBusiness({
        licenseData: undefined,
      }),
    });

    expect(result).toBeTruthy();
  });

  it("returns false when licence data lastUpdatedISO is the same", () => {
    const business = generateBusiness({
      licenseData: generateLicenseData({
        lastUpdatedISO: currentDateISOString,
      }),
    });
    const result = isLicenseDataFromDatabaseDataMoreRecent({
      businessFromDb: business,
      businessFromUpdateQueue: business,
    });

    expect(result).toBeFalsy();
  });

  it("returns false when licence data lastUpdatedISO businessFromUpdateQueue is more recent", () => {
    const moreRecentLicenceData = generateBusiness({
      licenseData: generateLicenseData({
        lastUpdatedISO: currentDatePlusOneHourISOString,
      }),
    });
    const olderLicenceData = generateBusiness({
      licenseData: generateLicenseData({
        lastUpdatedISO: currentDateISOString,
      }),
    });
    const result = isLicenseDataFromDatabaseDataMoreRecent({
      businessFromDb: olderLicenceData,
      businessFromUpdateQueue: moreRecentLicenceData,
    });

    expect(result).toBeFalsy();
  });

  it("returns true when licence data lastUpdatedISO businessFromDb is more recent", () => {
    const moreRecentLicenceData = generateBusiness({
      licenseData: generateLicenseData({
        lastUpdatedISO: currentDatePlusOneHourISOString,
      }),
    });
    const olderLicenceData = generateBusiness({
      licenseData: generateLicenseData({
        lastUpdatedISO: currentDateISOString,
      }),
    });
    const result = isLicenseDataFromDatabaseDataMoreRecent({
      businessFromDb: moreRecentLicenceData,
      businessFromUpdateQueue: olderLicenceData,
    });

    expect(result).toBeTruthy();
  });
});
