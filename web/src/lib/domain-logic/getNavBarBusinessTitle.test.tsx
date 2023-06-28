import { getMergedConfig } from "@/contexts/configContext";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import { LookupIndustryById, LookupLegalStructureById } from "@businessnjgovnavigator/shared";
import { generateProfileData, generateUserData } from "@businessnjgovnavigator/shared/test";

const Config = getMergedConfig();

describe("getNavBarBusinessTitle", () => {
  it("shows guest text if industryId is undefined", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        businessName: "",
        industryId: undefined,
        legalStructureId: "limited-liability-company",
      }),
    });
    const navBarBusinessTitle = getNavBarBusinessTitle(userData);
    expect(navBarBusinessTitle).toBe(Config.navigationDefaults.navBarGuestText);
  });

  it("shows guest text if legalStructureId is undefined", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        businessName: "businessName",
        industryId: "cannabis",
        legalStructureId: undefined,
      }),
    });
    const navBarBusinessTitle = getNavBarBusinessTitle(userData);
    expect(navBarBusinessTitle).toBe(Config.navigationDefaults.navBarGuestText);
  });

  it("shows businessName if business name is defined and legalStructureId and industryId are also defined", () => {
    const businessName = "businessName";
    const userData = generateUserData({
      profileData: generateProfileData({
        businessName: businessName,
        industryId: "cannabis",
        legalStructureId: "limited-liability-company",
      }),
    });
    const navBarBusinessTitle = getNavBarBusinessTitle(userData);
    expect(navBarBusinessTitle).toBe(businessName);
  });

  it("shows unnamed[industryId name][legalStructurId abbreviation] if legalStructureId and industryId are defined and business name is undefined", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        businessName: "",
        industryId: "cannabis",
        legalStructureId: "limited-liability-company",
      }),
    });
    const navBarBusinessTitle = getNavBarBusinessTitle(userData);
    expect(navBarBusinessTitle).toBe(
      `${Config.navigationDefaults.navBarUnnamedBusinessText} ${
        LookupIndustryById(userData?.profileData?.industryId).name
      } ${LookupLegalStructureById(userData?.profileData?.legalStructureId).abbreviation}`
    );
  });
});
