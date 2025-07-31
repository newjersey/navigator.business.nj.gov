import {
  generatev171Business,
  generatev171UserData,
} from "@db/migrations/v171_flatten_cigarette_license";
import { migrate_v171_to_v172 } from "@db/migrations/v172_add_cig_license_payment_info";

describe("migrate_v171_to_v172", () => {
  it("adds new fields", async () => {
    const id = "biz-1";
    const v171UserData = generatev171UserData({
      businesses: {
        id: generatev171Business({ id }),
      },
    });

    const v172UserData = migrate_v171_to_v172(v171UserData);
    expect(v172UserData.version).toBe(172);
    expect(v172UserData.businesses[id].version).toBe(172);
    expect(v172UserData.businesses[id].cigaretteLicenseData?.signerName).not.toBeNull();
    expect(v172UserData.businesses[id].cigaretteLicenseData?.signerRelationship).not.toBeNull();
    expect(v172UserData.businesses[id].cigaretteLicenseData?.signature).not.toBeNull();
    expect(v172UserData.businesses[id].cigaretteLicenseData?.paymentInfo).not.toBeNull();
  });
});
