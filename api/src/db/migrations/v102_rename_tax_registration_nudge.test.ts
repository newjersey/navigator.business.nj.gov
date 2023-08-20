import { generateV101Preferences, generateV101UserData } from "./v101_change_error_field";
import { migrate_v101_to_v102 } from "./v102_rename_tax_registration_nudge";

describe("migrate_v101_to_v102", () => {
  it("does nothing when sidebar cards do not contain tax-registration-nudge", () => {
    const v101 = generateV101UserData({
      preferences: generateV101Preferences({ visibleSidebarCards: [""] }),
    });
    const v102 = migrate_v101_to_v102(v101);
    expect(v102).toEqual({
      ...v101,
      version: 102,
    });
  });

  it("changes tax-registration-nudge to registered-for-taxes-nudge", () => {
    const v101 = generateV101UserData({
      preferences: generateV101Preferences({ visibleSidebarCards: ["tax-registration-nudge"] }),
    });
    const v102 = migrate_v101_to_v102(v101);
    expect(v102).toEqual({
      ...v101,
      preferences: {
        ...v101.preferences,
        visibleSidebarCards: ["registered-for-taxes-nudge"],
      },
      version: 102,
    });
  });

  it("keeps order and other cards", () => {
    const v101 = generateV101UserData({
      preferences: generateV101Preferences({
        visibleSidebarCards: ["other-card", "tax-registration-nudge", "other-card-2"],
      }),
    });
    const v102 = migrate_v101_to_v102(v101);
    expect(v102).toEqual({
      ...v101,
      preferences: {
        ...v101.preferences,
        visibleSidebarCards: ["other-card", "registered-for-taxes-nudge", "other-card-2"],
      },
      version: 102,
    });
  });
});
