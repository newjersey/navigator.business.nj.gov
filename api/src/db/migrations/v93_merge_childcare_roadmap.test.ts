import { v92UserDataGenerator } from "./v92_splits_profiledata_interface";
import { migrate_v92_to_v93 } from "./v93_merge_childcare_roadmaps";

describe("migrate_v92_to_v93", () => {
  it("converts the industryId from family-daycare to daycare with isChildcareForSixOrMore set to false", () => {
    const v92 = v92UserDataGenerator({ industryId: "family-daycare" });
    const v93 = migrate_v92_to_v93(v92);
    expect(v93).toEqual({
      ...v92,
      profileData: { ...v92.profileData, industryId: "daycare", isChildcareForSixOrMore: false },
      version: 93,
    });
  });

  it("sets isChildcareForSixOrMore set to true if the industryId is daycare", () => {
    const v92 = v92UserDataGenerator({ industryId: "daycare" });
    const v93 = migrate_v92_to_v93(v92);
    expect(v93).toEqual({
      ...v92,
      profileData: { ...v92.profileData, industryId: "daycare", isChildcareForSixOrMore: true },
      version: 93,
    });
  });

  it("sets isChildcareForSixOrMore set to undefined if the industryId is generic", () => {
    const v92 = v92UserDataGenerator({ industryId: "generic" });
    const v93 = migrate_v92_to_v93(v92);
    expect(v93).toEqual({
      ...v92,
      profileData: { ...v92.profileData, industryId: "generic", isChildcareForSixOrMore: undefined },
      version: 93,
    });
  });
});
