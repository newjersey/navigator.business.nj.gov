import { generateV103ProfileData, generateV103UserData } from "./v103_change_tax_calendar_view_default";
import { migrate_v103_to_v104 } from "./v104_add_needs_nexus_dba_name_field";

describe("migrate_v103_to_v104", () => {
  it("sets nexusDBAName to empty and adds and sets needsNexusDbaName to false if nexusDBAName was originally undefined", () => {
    const v103 = generateV103UserData({
      profileData: generateV103ProfileData({ nexusDbaName: undefined }),
    });
    const v104 = migrate_v103_to_v104(v103);
    expect(v104).toEqual({
      ...v103,
      profileData: {
        ...v103.profileData,
        nexusDbaName: "",
        needsNexusDbaName: false,
      },
      version: 104,
    });
  });

  it("keeps existing empty nexusDBAName and adds and sets needsNexusDBA to true if nexusDBAName was originally empty string", () => {
    const v103 = generateV103UserData({
      profileData: generateV103ProfileData({ nexusDbaName: "" }),
    });
    const v104 = migrate_v103_to_v104(v103);
    expect(v104).toEqual({
      ...v103,
      profileData: {
        ...v103.profileData,
        needsNexusDbaName: true,
      },
      version: 104,
    });
  });

  it("keeps existing nexusDBAName adds and sets needsNexusDBA to true if nexusDBAName was originally populated", () => {
    const v103 = generateV103UserData({
      profileData: generateV103ProfileData({ nexusDbaName: "some-cool-dba-name" }),
    });
    const v104 = migrate_v103_to_v104(v103);
    expect(v104).toEqual({
      ...v103,
      profileData: {
        ...v103.profileData,
        needsNexusDbaName: true,
      },
      version: 104,
    });
  });
});
