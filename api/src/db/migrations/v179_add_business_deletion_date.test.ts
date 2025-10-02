import {
  generatev178Business,
  generatev178UserData,
} from "@db/migrations/v178_add_employer_access";
import { migrate_v178_to_v179 } from "@db/migrations/v179_add_business_deletion_date";

describe("migrate_v178_to_v179", () => {
  it("adds new dateDeletedISO field to business", async () => {
    const id = "biz-1";
    const v178UserData = generatev178UserData({
      businesses: {
        id: generatev178Business({ id }),
      },
    });

    const v179UserData = migrate_v178_to_v179(v178UserData);
    expect(v179UserData.version).toBe(179);
    expect(v179UserData.businesses[id].version).toBe(179);
    expect(v179UserData.businesses[id].dateDeletedISO).toBe("");
  });
});
