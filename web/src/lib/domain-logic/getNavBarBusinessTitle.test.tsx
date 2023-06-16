import { getMergedConfig } from "@/contexts/configContext";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import {generateBusiness, LookupIndustryById, LookupLegalStructureById} from "@businessnjgovnavigator/shared";
import { generateProfileData} from "@businessnjgovnavigator/shared/test";

const Config = getMergedConfig();

describe("getNavBarBusinessTitle", () => {
  it("shows guest text if industryId is undefined", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        businessName: "",
        industryId: undefined,
        legalStructureId: "limited-liability-company",
      }),
    });
    const navBarBusinessTitle = getNavBarBusinessTitle(business);
    expect(navBarBusinessTitle).toEqual(Config.navigationDefaults.navBarGuestText);
  });

  it("shows guest text if legalStructureId is undefined", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        businessName: "businessName",
        industryId: "cannabis",
        legalStructureId: undefined,
      }),
    });
    const navBarBusinessTitle = getNavBarBusinessTitle(business);
    expect(navBarBusinessTitle).toEqual(Config.navigationDefaults.navBarGuestText);
  });

  it("shows businessName if business name is defined and legalStructureId and industryId are also defined", () => {
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

  it("shows unnamed[industryId name][legalStructurId abbreviation] if legalStructureId and industryId are defined and business name is undefined", () => {
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
});
