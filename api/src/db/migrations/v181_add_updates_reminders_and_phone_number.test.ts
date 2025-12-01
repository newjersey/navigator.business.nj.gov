import {
  generatev180BusinessUser,
  generatev180UserData,
} from "@db/migrations/v180_add_email_sent_environment_data";
import { migrate_v180_to_v181 } from "@db/migrations/v181_add_updates_reminders_and_phone_number";

describe("migrate_v180_to_v181", () => {
  it("adds receiveUpdatesAndReminders and phoneNumber fields to BusinessUser", async () => {
    const v180UserData = generatev180UserData({
      user: generatev180BusinessUser({}),
    });

    const v181UserData = migrate_v180_to_v181(v180UserData);
    expect(v181UserData.version).toBe(181);
    expect(v181UserData.user.receiveUpdatesAndReminders).toBe(true);
    expect(v181UserData.user.phoneNumber).toBeUndefined();
  });
});
