import {
  generatev170Business,
  generatev170UserData,
  generatev170CigaretteLicenseData,
} from "@db/migrations/v170_consolidate_environment_data";
import { migrate_v170_to_v171 } from "@db/migrations/v171_flatten_cigarette_license";

describe("migrate_v170_to_v171", () => {
  it("create flat version of the cigarette license address", async () => {
    const id = "biz-1";
    const v170UserData = generatev170UserData({
      businesses: {
        id: generatev170Business({ id }),
      },
    });

    const v171UserData = migrate_v170_to_v171(v170UserData);
    expect(v171UserData.version).toBe(171);
    expect(v171UserData.businesses[id].version).toBe(171);
    expect(v171UserData.businesses[id].cigaretteLicenseData?.addressLine1).not.toBeNull();
    expect(v171UserData.businesses[id].cigaretteLicenseData?.addressLine2).not.toBeNull();
    expect(v171UserData.businesses[id].cigaretteLicenseData?.mailingAddressLine1).not.toBeNull();
    expect(v171UserData.businesses[id].cigaretteLicenseData?.mailingAddressLine2).not.toBeNull();
  });

  it("convert nested address to flat version for the cigarette license data", async () => {
    const id = "biz-1";
    const v170UserData = generatev170UserData({
      businesses: {
        id: generatev170Business({
          id,
          cigaretteLicenseData: generatev170CigaretteLicenseData({
            businessAddress: {
              addressLine1: "test business line 1",
              addressLine2: "test business line 2",
              addressCity: "test business city",
              addressState: undefined,
              addressZipCode: "",
            },
            mailingAddress: {
              addressLine1: "test mailing line 1",
              addressLine2: "test mailing line 2",
              addressCity: "test mailing city",
              addressState: undefined,
              addressZipCode: "",
            },
          }),
        }),
      },
    });

    const v171UserData = migrate_v170_to_v171(v170UserData);
    expect(v171UserData.version).toBe(171);
    expect(v171UserData.businesses[id].version).toBe(171);
    expect(v171UserData.businesses[id].cigaretteLicenseData?.addressLine1).toBe(
      "test business line 1",
    );
    expect(v171UserData.businesses[id].cigaretteLicenseData?.addressLine2).toBe(
      "test business line 2",
    );
    expect(v171UserData.businesses[id].cigaretteLicenseData?.addressCity).toBe(
      "test business city",
    );
    expect(v171UserData.businesses[id].cigaretteLicenseData?.mailingAddressLine1).toBe(
      "test mailing line 1",
    );
    expect(v171UserData.businesses[id].cigaretteLicenseData?.mailingAddressLine2).toBe(
      "test mailing line 2",
    );
    expect(v171UserData.businesses[id].cigaretteLicenseData?.mailingAddressCity).toBe(
      "test mailing city",
    );
  });
});
