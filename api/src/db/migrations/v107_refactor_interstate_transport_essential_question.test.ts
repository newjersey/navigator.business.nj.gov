import {
  generateV106ProfileData,
  generateV106UserData,
} from "./v106_add_pet_care_housing_essential_question";
import { migrate_v106_to_v107 } from "./v107_refactor_interstate_transport_essential_question";

describe("migrate_v106_to_v107", () => {
  describe("interstateLogistics", () => {
    it("sets the interStateLogisticsApplicable onboarding question to true for existing users that answered yes", () => {
      const v106 = generateV106UserData({
        profileData: generateV106ProfileData({ industryId: "logistics", interstateTransport: true }),
      });
      const v107 = migrate_v106_to_v107(v106);
      expect(v107).toEqual({
        ...v106,
        profileData: {
          ...v106.profileData,
          isInterstateLogisticsApplicable: true,
          isInterstateMovingApplicable: false,
        },
        version: 107,
      });
    });

    it("sets the interStateLogisticsApplicable onboarding question to false for existing users that answered no", () => {
      const v106 = generateV106UserData({
        profileData: generateV106ProfileData({ industryId: "logistics", interstateTransport: false }),
      });
      const v107 = migrate_v106_to_v107(v106);
      expect(v107).toEqual({
        ...v106,
        profileData: {
          ...v106.profileData,
          isInterstateLogisticsApplicable: false,
          isInterstateMovingApplicable: false,
        },
        version: 107,
      });
    });

    it("sets the interStateLogisticsApplicable onboarding question to false for non-logistics existing users", () => {
      const v106 = generateV106UserData({
        profileData: generateV106ProfileData({ industryId: "generic", interstateTransport: false }),
      });
      const v107 = migrate_v106_to_v107(v106);
      expect(v107).toEqual({
        ...v106,
        profileData: {
          ...v106.profileData,
          isInterstateLogisticsApplicable: false,
          isInterstateMovingApplicable: false,
        },
        version: 107,
      });
    });
  });

  describe("interstateMoving", () => {
    it("sets interstateMovingApplicable onboarding question to true for existing users that answered yes", () => {
      const v106 = generateV106UserData({
        profileData: generateV106ProfileData({ industryId: "moving-company", interstateTransport: true }),
      });
      const v107 = migrate_v106_to_v107(v106);
      expect(v107).toEqual({
        ...v106,
        profileData: {
          ...v106.profileData,
          isInterstateLogisticsApplicable: false,
          isInterstateMovingApplicable: true,
        },
        version: 107,
      });
    });

    it("sets interstateMovingApplicable onboarding question to false for existing users that answered no", () => {
      const v106 = generateV106UserData({
        profileData: generateV106ProfileData({ industryId: "moving-company", interstateTransport: false }),
      });
      const v107 = migrate_v106_to_v107(v106);
      expect(v107).toEqual({
        ...v106,
        profileData: {
          ...v106.profileData,
          isInterstateLogisticsApplicable: false,
          isInterstateMovingApplicable: false,
        },
        version: 107,
      });
    });

    it("sets interstateMovingApplicable onboarding question to false for any non-moving company existing users", () => {
      const v106 = generateV106UserData({
        profileData: generateV106ProfileData({
          industryId: "generic",
          interstateTransport: false,
        }),
      });
      const v107 = migrate_v106_to_v107(v106);
      expect(v107).toEqual({
        ...v106,
        profileData: {
          ...v106.profileData,
          isInterstateLogisticsApplicable: false,
          isInterstateMovingApplicable: false,
        },
        version: 107,
      });
    });
  });
});
