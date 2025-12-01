import {
  generatev175Business,
  generatev175UserData,
} from "@db/migrations/v175_add_payment_complete_to_cig_license";
import { migrate_v175_to_v176 } from "@db/migrations/v176_add_check_name_reservation_options";

describe("migrate_v175_to_v176", () => {
  it("adds new field to formationFormData", async () => {
    const id = "biz-1";
    const v175UserData = generatev175UserData({
      businesses: {
        id: generatev175Business({ id }),
      },
    });

    const v176UserData = migrate_v175_to_v176(v175UserData);
    expect(v176UserData.version).toBe(176);
    expect(
      v176UserData.businesses[id].formationData.formationFormData.checkNameReservation,
    ).not.toBeNull();
    expect(v176UserData.businesses[id].formationData.formationFormData.howToProceed).not.toBeNull();
  });
});
