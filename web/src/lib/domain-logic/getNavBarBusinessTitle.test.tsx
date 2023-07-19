import { getMergedConfig } from "@/contexts/configContext";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import {
  generateBusiness,
  LookupIndustryById,
  LookupLegalStructureById,
} from "@businessnjgovnavigator/shared";
import { generateProfileData } from "@businessnjgovnavigator/shared/test";

const Config = getMergedConfig();

describe("getNavBarBusinessTitle", () => {
  it("shows guest text if industryId is undefined", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        businessName: "",
        tradeName: "",
        industryId: undefined,
      }),
    });
    const navBarBusinessTitle = getNavBarBusinessTitle(business);
    expect(navBarBusinessTitle).toEqual(Config.navigationDefaults.navBarGuestText);
  });

  it("shows businessName if business name is defined and industryId are also defined", () => {
    const businessName = "businessName";
    const business = generateBusiness({
      profileData: generateProfileData({
        businessName: businessName,
        industryId: "cannabis",
        legalStructureId: "limited-liability-company",
      }),
    });
    const navBarBusinessTitle = getNavBarBusinessTitle(business);
    expect(navBarBusinessTitle).toEqual(businessName);
  });

  it("shows businessName if business name is defined even if missing legal structure", () => {
    const businessName = "businessName";
    const business = generateBusiness({
      profileData: generateProfileData({
        businessName: businessName,
        tradeName: "",
        industryId: "cannabis",
        legalStructureId: undefined,
      }),
    });
    const navBarBusinessTitle = getNavBarBusinessTitle(business);
    expect(navBarBusinessTitle).toEqual(businessName);
  });

  it("shows trade Name if trade name is defined for Trade Name type and industryId are also defined", () => {
    const businessName = "businessName";
    const business = generateBusiness({
      profileData: generateProfileData({
        tradeName: businessName,
        industryId: "cannabis",
        legalStructureId: "sole-proprietorship",
      }),
    });
    const navBarBusinessTitle = getNavBarBusinessTitle(business);
    expect(navBarBusinessTitle).toEqual(businessName);
  });

  it("shows trade Name if trade name is defined even if missing legal structure", () => {
    const businessName = "businessName";
    const business = generateBusiness({
      profileData: generateProfileData({
        tradeName: businessName,
        businessName: "",
        industryId: "cannabis",
        legalStructureId: undefined,
      }),
    });
    const navBarBusinessTitle = getNavBarBusinessTitle(business);
    expect(navBarBusinessTitle).toEqual(businessName);
  });

  it("prefers business name over trade name if both are defined and we don't know legal structure", () => {
    const businessName = "businessName";
    const business = generateBusiness({
      profileData: generateProfileData({
        tradeName: "trade name",
        businessName: businessName,
        industryId: "cannabis",
        legalStructureId: undefined,
      }),
    });
    const navBarBusinessTitle = getNavBarBusinessTitle(business);
    expect(navBarBusinessTitle).toEqual(businessName);
  });

  it("shows unnamed[industryId name] abbreviation if industryId is defined and business name & legal structure is undefined", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        businessName: "",
        tradeName: "",
        industryId: "cannabis",
        legalStructureId: undefined,
      }),
    });
    const navBarBusinessTitle = getNavBarBusinessTitle(business);
    expect(navBarBusinessTitle).toBe(
      `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
        LookupIndustryById(business?.profileData?.industryId).name
      }`
    );
  });

  it("shows unnamed[industryId name][legalStructureId] abbreviation if legalStructureId and industryId are defined and business name is undefined", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        businessName: "",
        industryId: "cannabis",
        legalStructureId: "limited-liability-company",
      }),
    });
    const navBarBusinessTitle = getNavBarBusinessTitle(business);
    expect(navBarBusinessTitle).toBe(
      `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
        LookupIndustryById(business?.profileData?.industryId).name
      } ${LookupLegalStructureById(business?.profileData?.legalStructureId).abbreviation}`
    );
  });

  it("shows unnamed[industryId name][legalStructureId] abbreviation if legalStructureId and industryId are defined and trade name is undefined", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        tradeName: "",
        industryId: "cannabis",
        legalStructureId: "sole-proprietorship",
      }),
    });
    const navBarBusinessTitle = getNavBarBusinessTitle(business);
    expect(navBarBusinessTitle).toBe(
      `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
        LookupIndustryById(business?.profileData?.industryId).name
      } ${LookupLegalStructureById(business?.profileData?.legalStructureId).abbreviation}`
    );
  });
});
