import {
  generateV102Preferences,
  generateV102ProfileData,
  generateV102UserData,
  v102OperatingPhase,
} from "./v102_rename_tax_registration_nudge";
import { migrate_v102_to_v103 } from "./v103_change_tax_calendar_view_default";

describe("migrate_v102_to_v103", () => {
  it("does nothing when user is UP_AND_RUNNING", () => {
    const v102 = generateV102UserData({
      preferences: generateV102Preferences({ isCalendarFullView: true }),
      profileData: generateV102ProfileData({ operatingPhase: "UP_AND_RUNNING" }),
    });
    const v103 = migrate_v102_to_v103(v102);
    expect(v103).toEqual({
      ...v102,
      version: 103,
    });
  });

  it("does nothing when user is UP_AND_RUNNING_OWNING", () => {
    const v102 = generateV102UserData({
      preferences: generateV102Preferences({ isCalendarFullView: true }),
      profileData: generateV102ProfileData({ operatingPhase: "UP_AND_RUNNING_OWNING" }),
    });
    const v103 = migrate_v102_to_v103(v102);
    expect(v103).toEqual({
      ...v102,
      version: 103,
    });
  });

  describe("changes isCalendarFullView from true to false", () => {
    const operatingPhases = [
      "GUEST_MODE",
      "NEEDS_TO_FORM",
      "NEEDS_TO_REGISTER_FOR_TAXES",
      "FORMED_AND_REGISTERED",
    ];
    for (const phase of operatingPhases) {
      it(`when user phase is ${phase}`, () => {
        const v102 = generateV102UserData({
          preferences: generateV102Preferences({ isCalendarFullView: true }),
          profileData: generateV102ProfileData({ operatingPhase: phase as v102OperatingPhase }),
        });
        const v103 = migrate_v102_to_v103(v102);
        expect(v103).toEqual({
          ...v102,
          preferences: {
            ...v102.preferences,
            isCalendarFullView: false,
          },
          version: 103,
        });
      });
    }
  });
});
