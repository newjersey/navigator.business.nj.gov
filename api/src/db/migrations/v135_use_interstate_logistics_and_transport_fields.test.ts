import {
  generatev134Business,
  generatev134ProfileData,
  generatev134UserData,
} from "@db/migrations/v134_added_planned_renovation_question_field";
import { migrate_v134_to_v135 } from "@db/migrations/v135_use_interstate_logistics_and_transport_fields";

describe("v135_use_interstate_logistics_and_transport_fields", () => {
  it("correctly upgrades a v134 user who should have interstateLogistics true", () => {
    const id = "biz-1";
    const interstateLogisticsIndustryId = "logistics";
    const v134ProfileData = generatev134ProfileData({ industryId: interstateLogisticsIndustryId });
    const v134Business = generatev134Business({
      profileData: v134ProfileData,
      id,
    });
    const v134User = generatev134UserData({
      businesses: { "biz-1": v134Business },
    });

    expect(v134User.businesses[id].profileData).not.toHaveProperty("interstateLogistics");
    expect(v134User.businesses[id].profileData).toHaveProperty("isInterstateLogisticsApplicable");

    const v135User = migrate_v134_to_v135(v134User);

    expect(v135User.businesses[id].profileData).toHaveProperty("interstateLogistics");
    expect(v135User.businesses[id].profileData).not.toHaveProperty("isInterstateLogisticsApplicable");
    expect(v135User.businesses[id].profileData).not.toHaveProperty("isInterstateMovingApplicable");
    expect(v135User.businesses[id].profileData.interstateLogistics).toEqual(true);
    expect(v135User.businesses[id].profileData.interstateMoving).toEqual(false);
  });

  it("correctly upgrades a v134 user who should have interstateMoving true", () => {
    const id = "biz-1";
    const interstateMovingIndustryId = "moving-company";
    const v134ProfileData = generatev134ProfileData({ industryId: interstateMovingIndustryId });
    const v134Business = generatev134Business({
      profileData: v134ProfileData,
      id,
    });
    const v134User = generatev134UserData({
      businesses: { "biz-1": v134Business },
    });

    expect(v134User.businesses[id].profileData).not.toHaveProperty("interstateMoving");
    expect(v134User.businesses[id].profileData).toHaveProperty("isInterstateMovingApplicable");

    const v135User = migrate_v134_to_v135(v134User);

    expect(v135User.businesses[id].profileData).toHaveProperty("interstateMoving");
    expect(v135User.businesses[id].profileData).not.toHaveProperty("isInterstateMovingApplicable");
    expect(v135User.businesses[id].profileData).not.toHaveProperty("isInterstateLogisticsApplicable");
    expect(v135User.businesses[id].profileData.interstateMoving).toEqual(true);
    expect(v135User.businesses[id].profileData.interstateLogistics).toEqual(false);
  });

  it("correctly upgrades a v134 user who should not have interstateMoving or interstateLogistics", () => {
    const id = "biz-1";
    const unrelatedIndustryId = "cosmetology";
    const v134ProfileData = generatev134ProfileData({ industryId: unrelatedIndustryId });
    const v134Business = generatev134Business({
      profileData: v134ProfileData,
      id,
    });
    const v134User = generatev134UserData({
      businesses: { "biz-1": v134Business },
    });

    expect(v134User.businesses[id].profileData).toHaveProperty("isInterstateMovingApplicable");
    expect(v134User.businesses[id].profileData).toHaveProperty("isInterstateLogisticsApplicable");

    const v135User = migrate_v134_to_v135(v134User);

    expect(v135User.businesses[id].profileData).not.toHaveProperty("isInterstateMovingApplicable");
    expect(v135User.businesses[id].profileData).not.toHaveProperty("isInterstateLogisticsApplicable");
    expect(v135User.businesses[id].profileData.interstateLogistics).toEqual(false);
    expect(v135User.businesses[id].profileData.interstateMoving).toEqual(false);
  });
});
