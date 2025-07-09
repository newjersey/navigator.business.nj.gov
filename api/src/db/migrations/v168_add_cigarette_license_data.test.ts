import {
  generatev167Business,
  generatev167UserData,
} from "@db/migrations/v167_update_agent_number_or_manual_options";
import { migrate_v167_to_v168 } from "@db/migrations/v168_add_cigarette_license_data";

describe("migrate_v167_to_v168", () => {
  it("add the cigarette license object to the business data", async () => {
    const id = "biz-1";
    const v167UserData = generatev167UserData({
      businesses: {
        id: generatev167Business({ id }),
      },
    });

    const v168UserData = migrate_v167_to_v168(v167UserData);
    expect(v168UserData.version).toBe(168);
    expect(v168UserData.businesses[id].version).toBe(168);
    expect(v168UserData.businesses[id].cigaretteLicenseData).not.toBeNull();
  });
});
