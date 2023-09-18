import { filterFundings } from "@/lib/domain-logic/filterFundings";
import { SMALL_BUSINESS_MAX_EMPLOYEE_COUNT } from "@/lib/domain-logic/smallBusinessEnterprise";
import { generateFunding } from "@/test/factories";
import {
  generateBusiness,
  generateMunicipality,
  generateProfileData,
} from "@businessnjgovnavigator/shared/test";

describe("filterFundings", () => {
  it("shows home-based-business yes or unknown when user home-based-business is true", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        homeBasedBusiness: true,
        municipality: undefined,
        existingEmployees: "0",
        sectorId: undefined,
      }),
    });
    const funding1 = generateFunding({
      homeBased: "yes",
      employeesRequired: "n/a",
      status: "rolling application",
    });
    const funding2 = generateFunding({
      homeBased: "no",
      employeesRequired: "n/a",
      status: "rolling application",
    });
    const funding3 = generateFunding({
      homeBased: "unknown",
      employeesRequired: "n/a",
      status: "rolling application",
    });
    const funding4 = generateFunding({
      homeBased: "yes",
      employeesRequired: "50",
      status: "rolling application",
    });
    const funding5 = generateFunding({
      homeBased: "yes",
      employeesRequired: "n/a",
      publishStageArchive: "Do Not Publish",
    });
    const fundings = [funding1, funding2, funding3, funding4, funding5];
    const result = filterFundings(fundings, business);
    expect(result.length).toEqual(2);
    expect(result).toEqual(expect.arrayContaining([funding1, funding3]));
  });

  it("shows all when user home-based-business is false", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "0",
        sectorId: undefined,
      }),
    });
    const funding1 = generateFunding({
      homeBased: "yes",
      employeesRequired: "n/a",
      status: "rolling application",
    });
    const funding2 = generateFunding({
      homeBased: "no",
      employeesRequired: "n/a",
      status: "rolling application",
    });
    const funding3 = generateFunding({
      homeBased: "unknown",
      employeesRequired: "n/a",
      status: "rolling application",
    });
    const funding4 = generateFunding({
      homeBased: "yes",
      employeesRequired: "50",
      status: "rolling application",
    });
    const funding5 = generateFunding({
      homeBased: "yes",
      employeesRequired: "n/a",
      publishStageArchive: "Do Not Publish",
    });
    const fundings = [funding1, funding2, funding3, funding4, funding5];

    const result = filterFundings(fundings, business);
    expect(result.length).toEqual(3);
    expect(result).toEqual(expect.arrayContaining([funding1, funding2, funding3]));
  });

  describe("filtering by municipality", () => {
    it("shows fundings where user municipality is in specified county", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          homeBasedBusiness: false,
          municipality: generateMunicipality({ county: "Atlantic" }),
          sectorId: undefined,
          existingEmployees: "1",
        }),
      });

      const funding1 = generateFunding({ county: ["Atlantic"], status: "rolling application" });
      const funding2 = generateFunding({ county: [], status: "rolling application" });
      const funding3 = generateFunding({ county: ["Bergen", "Atlantic"], status: "rolling application" });
      const funding4 = generateFunding({ county: ["Bergen", "Camden"], status: "rolling application" });
      const funding5 = generateFunding({ county: ["All"], status: "rolling application" });
      const funding6 = generateFunding({ county: ["All", "Camden"], status: "rolling application" });
      const funding7 = generateFunding({
        county: ["All", "Camden"],
        status: "rolling application",
        publishStageArchive: "Do Not Publish",
      });
      const fundings = [funding1, funding2, funding3, funding4, funding5, funding6, funding7];

      const result = filterFundings(fundings, business);
      expect(result.length).toEqual(5);
      expect(result).toEqual(expect.arrayContaining([funding1, funding2, funding3, funding5, funding6]));
    });

    it("shows fundings where user municipality is undefined", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          homeBasedBusiness: false,
          municipality: undefined,
          sectorId: undefined,
          existingEmployees: "1",
        }),
      });

      const funding1 = generateFunding({ county: ["Atlantic"], status: "rolling application" });
      const funding2 = generateFunding({ county: [], status: "rolling application" });
      const funding3 = generateFunding({ county: ["Bergen", "Atlantic"], status: "rolling application" });
      const funding4 = generateFunding({ county: ["Bergen", "Camden"], status: "rolling application" });
      const funding5 = generateFunding({ county: ["All"], status: "rolling application" });
      const funding6 = generateFunding({ county: ["All", "Camden"], status: "rolling application" });
      const funding7 = generateFunding({
        county: ["All", "Camden"],
        status: "rolling application",
        publishStageArchive: "Do Not Publish",
      });
      const fundings = [funding1, funding2, funding3, funding4, funding5, funding6, funding7];

      const result = filterFundings(fundings, business);
      expect(result.length).toEqual(6);
      expect(result).toEqual(
        expect.arrayContaining([funding1, funding2, funding3, funding4, funding5, funding6])
      );
    });
  });

  it("does not display any fundings with a past due due date", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "1",
        sectorId: undefined,
      }),
    });
    const funding1 = generateFunding({
      employeesRequired: "n/a",
      status: "deadline",
      dueDate: "07/01/2022",
    });
    const funding2 = generateFunding({
      employeesRequired: "n/a",
      status: "rolling application",
    });

    const fundings = [funding1, funding2];

    const result = filterFundings(fundings, business);
    expect(result.length).toEqual(1);
    expect(result).toEqual(expect.arrayContaining([funding2]));
  });

  it("displays any fundings with a due date in the future", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "1",
        sectorId: undefined,
      }),
    });
    const funding1 = generateFunding({
      employeesRequired: "n/a",
      status: "deadline",
      dueDate: "07/01/2050",
    });

    const funding2 = generateFunding({
      employeesRequired: "n/a",
      status: "rolling application",
    });

    const fundings = [funding1, funding2];

    const result = filterFundings(fundings, business);
    expect(result.length).toEqual(2);
    expect(result).toEqual(expect.arrayContaining([funding1, funding2]));
  });

  it("does not display any fundings marked as Do Not Publish", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "1",
        sectorId: undefined,
      }),
    });
    const funding1 = generateFunding({
      employeesRequired: "n/a",
      status: "rolling application",
      publishStageArchive: "Do Not Publish",
    });
    const funding2 = generateFunding({
      employeesRequired: "n/a",
      status: "rolling application",
      publishStageArchive: null,
    });
    const funding3 = generateFunding({
      employeesRequired: "200",
      status: "rolling application",
      publishStageArchive: "Do Not Publish",
    });
    const fundings = [funding1, funding2, funding3];

    const result = filterFundings(fundings, business);
    expect(result.length).toEqual(1);
    expect(result).toEqual(expect.arrayContaining([funding2]));
  });

  describe("filtering by number of employees", () => {
    it('displays only fundings with employeesRequired "n/a" when # employees is 0', () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          homeBasedBusiness: false,
          municipality: undefined,
          existingEmployees: "0",
          sectorId: undefined,
        }),
      });
      const funding1 = generateFunding({ employeesRequired: "n/a", status: "rolling application" });
      const funding2 = generateFunding({ employeesRequired: "yes", status: "rolling application" });
      const funding3 = generateFunding({
        employeesRequired: "n/a",
        status: "rolling application",
        publishStageArchive: "Do Not Publish",
      });
      const fundings = [funding1, funding2, funding3];

      const result = filterFundings(fundings, business);
      expect(result.length).toEqual(1);
      expect(result).toEqual(expect.arrayContaining([funding1]));
    });

    it('displays only fundings with employeesRequired "n/a" when # employees is equivalent to 0', () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          homeBasedBusiness: false,
          municipality: undefined,
          existingEmployees: "00",
          sectorId: undefined,
        }),
      });
      const funding1 = generateFunding({ employeesRequired: "n/a", status: "rolling application" });
      const funding2 = generateFunding({ employeesRequired: "yes", status: "rolling application" });
      const funding3 = generateFunding({
        employeesRequired: "n/a",
        status: "rolling application",
        publishStageArchive: null,
      });
      const fundings = [funding1, funding2, funding3];

      const result = filterFundings(fundings, business);
      expect(result.length).toEqual(2);
      expect(result).toEqual(expect.arrayContaining([funding1, funding3]));
    });

    it("displays all fundings when # employees > 0", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          homeBasedBusiness: false,
          municipality: undefined,
          existingEmployees: "0123",
          sectorId: undefined,
        }),
      });
      const funding1 = generateFunding({
        employeesRequired: "n/a",
        status: "rolling application",
        certifications: [],
      });
      const funding2 = generateFunding({
        employeesRequired: "yes",
        status: "rolling application",
        certifications: [],
      });
      const fundings = [funding1, funding2];

      const result = filterFundings(fundings, business);
      expect(result.length).toEqual(2);
      expect(result).toEqual(expect.arrayContaining([funding1, funding2]));
    });

    it("displays all fundings when # employees is not answered", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          homeBasedBusiness: false,
          municipality: undefined,
          existingEmployees: undefined,
          sectorId: undefined,
        }),
      });
      const funding1 = generateFunding({ employeesRequired: "n/a", status: "rolling application" });
      const funding2 = generateFunding({ employeesRequired: "yes", status: "rolling application" });
      const fundings = [funding1, funding2];

      const result = filterFundings(fundings, business);
      expect(result.length).toEqual(2);
      expect(result).toEqual(expect.arrayContaining([funding1, funding2]));
    });
  });

  it("shows fundings where user sector is in specified sectors list", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "1",
        sectorId: "construction",
      }),
    });

    const funding1 = generateFunding({ sector: ["construction"], status: "rolling application" });
    const funding2 = generateFunding({ sector: [], status: "rolling application" });
    const funding3 = generateFunding({ sector: ["construction", "cannabis"], status: "rolling application" });
    const funding4 = generateFunding({
      sector: ["cannabis", "manufacturing"],
      status: "rolling application",
    });
    const funding5 = generateFunding({ sector: ["Construction"], status: "rolling application" });
    const fundings = [funding1, funding2, funding3, funding4, funding5];

    const result = filterFundings(fundings, business);
    expect(result.length).toEqual(4);
    expect(result).toEqual(expect.arrayContaining([funding1, funding2, funding3]));
  });

  describe("certifications", () => {
    const funding1 = generateFunding({
      certifications: ["woman-owned"],
    });
    const funding2 = generateFunding({ certifications: ["minority-owned"] });
    const funding3 = generateFunding({ certifications: ["veteran-owned"] });
    const funding4 = generateFunding({ certifications: ["disabled-veteran"] });
    const funding5 = generateFunding({ certifications: ["small-business-enterprise"] });
    const funding6 = generateFunding({ certifications: ["disadvantaged-business-enterprise"] });
    const funding7 = generateFunding({ certifications: ["emerging-small-business-enterprise"] });
    const funding8 = generateFunding({ certifications: [] });

    const listOfFundingTypes = [funding1, funding2, funding3, funding4, funding5, funding6, funding7];

    it("returns a generic funding when certifications are not defined", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          ownershipTypeIds: ["woman-owned", "veteran-owned"],
          homeBasedBusiness: false,
          sectorId: undefined,
          existingEmployees: undefined,
          municipality: undefined,
        }),
      });

      const result = filterFundings([funding8], business);
      expect(result.length).toEqual(1);
      expect(result).toEqual(expect.arrayContaining([funding8]));
    });

    it("does not return ownership types funding's when applicable ownership types do not match", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          ownershipTypeIds: ["woman-owned", "veteran-owned"],
          homeBasedBusiness: false,
          sectorId: undefined,
          existingEmployees: undefined,
          municipality: undefined,
        }),
      });

      const result = filterFundings(listOfFundingTypes, business);
      expect(result.length).toEqual(5);
      expect(result).toEqual(expect.arrayContaining([funding1, funding3, funding5, funding6, funding7]));
    });

    it("does not return sbe funding when existing employees is greater than small business threshold", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          ownershipTypeIds: [],
          homeBasedBusiness: false,
          sectorId: undefined,
          existingEmployees: SMALL_BUSINESS_MAX_EMPLOYEE_COUNT.toString(),
          municipality: undefined,
        }),
      });

      const result = filterFundings(listOfFundingTypes, business);
      expect(result.length).toEqual(6);
      expect(result).toEqual(
        expect.arrayContaining([funding1, funding2, funding3, funding4, funding6, funding7])
      );
    });

    it("returns sbe funding when existing employees is greater than small business threshold", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          ownershipTypeIds: [],
          homeBasedBusiness: false,
          sectorId: undefined,
          existingEmployees: (SMALL_BUSINESS_MAX_EMPLOYEE_COUNT - 1).toString(),
          municipality: undefined,
        }),
      });

      const result = filterFundings(listOfFundingTypes, business);
      expect(result.length).toEqual(7);
      expect(result).toEqual(
        expect.arrayContaining([funding1, funding2, funding3, funding4, funding5, funding6, funding7])
      );
    });
  });

  describe("isNonprofitOnly", () => {
    it("includes fundings marked as isNonprofitOnly when user legal structure is nonprofit", () => {
      const funding = generateFunding({ isNonprofitOnly: true });
      const business = generateBusiness({
        profileData: generateProfileData({
          legalStructureId: "nonprofit",
          ownershipTypeIds: [],
          homeBasedBusiness: false,
          sectorId: undefined,
          existingEmployees: (SMALL_BUSINESS_MAX_EMPLOYEE_COUNT - 1).toString(),
          municipality: undefined,
        }),
      });

      const result = filterFundings([funding], business);
      expect(result.length).toEqual(1);
      expect(result).toEqual(expect.arrayContaining([funding]));
    });

    it("includes fundings marked as isNonprofitOnly when user legal structure is not yet defined", () => {
      const funding = generateFunding({ isNonprofitOnly: true });
      const business = generateBusiness({
        profileData: generateProfileData({
          legalStructureId: undefined,
          ownershipTypeIds: [],
          homeBasedBusiness: false,
          sectorId: undefined,
          existingEmployees: (SMALL_BUSINESS_MAX_EMPLOYEE_COUNT - 1).toString(),
          municipality: undefined,
        }),
      });

      const result = filterFundings([funding], business);
      expect(result.length).toEqual(1);
      expect(result).toEqual(expect.arrayContaining([funding]));
    });

    it("does not include fundings marked as isNonprofitOnly when user legal structure is not nonprofit", () => {
      const funding = generateFunding({ isNonprofitOnly: true });
      const business = generateBusiness({
        profileData: generateProfileData({
          legalStructureId: "limited-liability-company",
          ownershipTypeIds: [],
          homeBasedBusiness: false,
          sectorId: undefined,
          existingEmployees: (SMALL_BUSINESS_MAX_EMPLOYEE_COUNT - 1).toString(),
          municipality: undefined,
        }),
      });

      const result = filterFundings([funding], business);
      expect(result.length).toEqual(0);
      expect(result).toEqual(expect.arrayContaining([]));
    });
  });

  it("includes fundings marked as NOT isNonprofitOnly when user legal structure is nonprofit", () => {
    const funding = generateFunding({ isNonprofitOnly: false });
    const business = generateBusiness({
      profileData: generateProfileData({
        legalStructureId: "nonprofit",
        ownershipTypeIds: [],
        homeBasedBusiness: false,
        sectorId: undefined,
        existingEmployees: (SMALL_BUSINESS_MAX_EMPLOYEE_COUNT - 1).toString(),
        municipality: undefined,
      }),
    });

    const result = filterFundings([funding], business);
    expect(result.length).toEqual(1);
    expect(result).toEqual(expect.arrayContaining([funding]));
  });

  it("includes fundings marked as NOT isNonprofitOnly when user legal structure is not nonprofit", () => {
    const funding = generateFunding({ isNonprofitOnly: false });
    const business = generateBusiness({
      profileData: generateProfileData({
        legalStructureId: "limited-liability-company",
        ownershipTypeIds: [],
        homeBasedBusiness: false,
        sectorId: undefined,
        existingEmployees: (SMALL_BUSINESS_MAX_EMPLOYEE_COUNT - 1).toString(),
        municipality: undefined,
      }),
    });

    const result = filterFundings([funding], business);
    expect(result.length).toEqual(1);
    expect(result).toEqual(expect.arrayContaining([funding]));
  });
});
