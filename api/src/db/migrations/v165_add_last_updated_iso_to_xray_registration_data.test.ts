import {
  generatev164Business,
  generatev164UserData,
  generatev164XrayRegistrationData,
} from "@db/migrations/v164_track_tax_clearance_primary_business";
import { migrate_v164_to_v165 } from "@db/migrations/v165_add_last_updated_iso_to_xray_registration_data";
import { getCurrentDate } from "@shared/dateHelpers";
import dayjs from "dayjs";

describe("migrate_v164_to_v165", () => {
  it("adds lastUpdatedISO with the value of currentDate to xrayRegistrationData", async () => {
    const id = "biz-1";
    const v164UserData = generatev164UserData({
      businesses: {
        id: generatev164Business({
          id,
          xrayRegistrationData: generatev164XrayRegistrationData(),
        }),
      },
    });
    const v165UserData = await migrate_v164_to_v165(v164UserData);
    expect(dayjs(v165UserData.businesses[id].xrayRegistrationData?.lastUpdatedISO).minute()).toBe(
      getCurrentDate().minute(),
    );
  });
});
