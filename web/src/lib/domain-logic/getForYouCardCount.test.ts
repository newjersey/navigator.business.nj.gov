import { getForYouCardCount } from "@/lib/domain-logic/getForYouCardCount";
import { Certification, Funding } from "@/lib/types/types";
import { generateCertification, generateFunding } from "@/test/factories";
import { generateBusiness, generateProfileData } from "@businessnjgovnavigator/shared/test";

describe("getForYouCardCount", () => {
  const business = generateBusiness({
    profileData: generateProfileData({
      operatingPhase: "GUEST_MODE_OWNING",
      municipality: undefined,
      sectorId: undefined,
      existingEmployees: "50",
    }),
  });

  it("returns a zero count when business is undefined", () => {
    const certification: Certification[] = [];
    const funding: Funding[] = [];
    expect(getForYouCardCount(undefined, certification, funding)).toEqual(0);
  });

  it("returns a count of zero when only business is defined", () => {
    const certification: Certification[] = [];
    const funding: Funding[] = [];
    expect(getForYouCardCount(business, certification, funding)).toEqual(0);
  });

  it("returns a count of one when business is defined and it has one certification", () => {
    const certification: Certification[] = [generateCertification({})];
    const funding: Funding[] = [];
    expect(getForYouCardCount(business, certification, funding)).toEqual(1);
  });

  it("returns a count of two when business is defined and it has one certification and one funding", () => {
    const certification: Certification[] = [generateCertification({})];
    const funding: Funding[] = [
      generateFunding({
        certifications: ["minority-owned"],
        status: "rolling application",
        isNonprofitOnly: false,
        sector: ["manufacturing"],
        dueDate: "",
        homeBased: "unknown",
        employeesRequired: ">200",
      }),
    ];
    expect(getForYouCardCount(business, certification, funding)).toEqual(2);
  });
});
