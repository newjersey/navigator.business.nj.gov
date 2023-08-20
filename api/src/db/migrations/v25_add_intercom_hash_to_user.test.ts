import { generateHashedKey } from "../../../test/helpers";
import {
  generatev24ProfileData,
  generatev24User,
  v24EntityIdStatus,
  v24TaxFiling,
  v24UserData,
} from "./v24_restructure_tax_filings";
import { migrate_v24_to_v25 } from "./v25_add_intercom_hash_to_user";

describe("migrate_v24_to_v25", () => {
  const formProgress = "UNSTARTED";
  const taskProgress = {};
  const preferences = {
    roadmapOpenSections: [],
    roadmapOpenSteps: [],
  };
  const taxFilingData = {
    entityIdStatus: "UNKNOWN" as v24EntityIdStatus,
    filings: [] as v24TaxFiling[],
  };

  it("hashes existing myNJkey and adds as intercom hash", () => {
    const user = generatev24User({ myNJUserKey: "some-mynj-key" });
    const profileData = generatev24ProfileData({});

    const hashedKey = generateHashedKey("some-mynj-key");

    const v24: v24UserData = {
      user,
      profileData,
      preferences,
      taxFilingData,
      formProgress,
      taskProgress,
      licenseData: undefined,
      version: 24,
    };

    const v25 = migrate_v24_to_v25(v24);

    expect(v25.user.intercomHash).toEqual(hashedKey);
  });

  it("adds undefined hash if myNJkey is undefined", () => {
    const user = generatev24User({ myNJUserKey: undefined });
    const profileData = generatev24ProfileData({});
    const v24: v24UserData = {
      user,
      profileData,
      preferences,
      taxFilingData,
      formProgress,
      taskProgress,
      licenseData: undefined,
      version: 24,
    };

    const v25 = migrate_v24_to_v25(v24);

    expect(v25.user.intercomHash).toBeUndefined();
  });
});
