import {
  generatev163Business,
  generatev163UserData,
  generatev163XrayRegistrationData,
} from "@db/migrations/v163_waste_transport_to_waste_data";
import { migrate_v163_to_v164 } from "@db/migrations/v164_add_last_updated_iso_to_xray_registration_data";
import { getCurrentDate } from "@shared/dateHelpers";
import dayjs from "dayjs";

describe("migrate_v163_to_v164", () => {
  it("adds lastUpdatedISO with the value of currentDate to xrayRegistrationData", async () => {
    const id = "biz-1";
    const v163UserData = generatev163UserData({
      businesses: {
        id: generatev163Business({
          id,
          xrayRegistrationData: generatev163XrayRegistrationData(),
        }),
      },
    });
    const v164UserData = await migrate_v163_to_v164(v163UserData);
    expect(dayjs(v164UserData.businesses[id].xrayRegistrationData?.lastUpdatedISO).minute()).toBe(
      getCurrentDate().minute(),
    );
  });
});
