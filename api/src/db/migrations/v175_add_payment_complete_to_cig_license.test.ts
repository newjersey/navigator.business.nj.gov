import {
  generatev174Business,
  generatev174UserData,
} from "@db/migrations/v174_add_public_works_contractor";
import { migrate_v174_to_v175 } from "@db/migrations/v175_add_payment_complete_to_cig_license";

describe("migrate_v174_to_v175", () => {
  it("adds new field", async () => {
    const id = "biz-1";
    const v174UserData = generatev174UserData({
      businesses: {
        id: generatev174Business({ id }),
      },
    });

    const v175UserData = migrate_v174_to_v175(v174UserData);
    expect(v175UserData.version).toBe(175);
    expect(
      v175UserData.businesses[id].cigaretteLicenseData?.paymentInfo?.paymentComplete,
    ).not.toBeNull();
  });
});
