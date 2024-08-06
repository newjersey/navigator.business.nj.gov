import {
  filterCertifications,
  filterFundings,
  getForYouCardCount,
  getHiddenCertifications,
  getHiddenFundings,
  getVisibleCertifications,
  getVisibleFundings,
  getVisibleSideBarCards,
  sortCertifications,
  sortFundings,
} from "@/lib/domain-logic/sidebarCardsHelpers";
import { SMALL_BUSINESS_MAX_EMPLOYEE_COUNT } from "@/lib/domain-logic/smallBusinessEnterprise";
import { Certification, Funding, SidebarCardContent } from "@/lib/types/types";
import {
  generateCertification,
  generateFunding,
  generateSidebarCardContent,
  randomFundingCertification,
} from "@/test/factories";
import { Business, generateUser, generateUserData } from "@businessnjgovnavigator/shared";
import { OperatingPhaseId, ProfileData } from "@businessnjgovnavigator/shared/";
import {
  generateBusiness,
  generateMunicipality,
  generatePreferences,
  generateProfileData,
} from "@businessnjgovnavigator/shared/test";

describe("sidebarCard Helpers", () => {
  describe("getHiddenCertifications", () => {
    it("returns an empty array when business is undefined", () => {
      const certifications = [generateCertification({})];
      expect(getHiddenCertifications(undefined, certifications).length).toEqual(0);
    });

    it("returns hidden certifications when there is a match", () => {
      const business = generateBusiness({
        preferences: generatePreferences({ hiddenCertificationIds: ["three"] }),
      });
      const certification = generateCertification({ id: "three" });
      expect(getHiddenCertifications(business, [certification]).length).toEqual(1);
      expect(getHiddenCertifications(business, [certification])).toEqual([certification]);
    });
  });

  describe("sortCertifications", () => {
    it("sorts certifications alphabetically case-insensitive", () => {
      const cert1 = generateCertification({ name: "bca" });
      const cert2 = generateCertification({ name: "Abc" });
      const cert3 = generateCertification({ name: "cba" });
      const cert4 = generateCertification({ name: "acb" });
      const certs = [cert1, cert2, cert3, cert4];

      const result = sortCertifications(certs);
      expect(result.length).toEqual(4);
      expect(result).toEqual([cert2, cert4, cert1, cert3]);
    });

    it("does not change the sorting if the names are the same", () => {
      const cert1 = generateCertification({ name: "bca", isSbe: true });
      const cert2 = generateCertification({ name: "bca", isSbe: false });
      const certs = [cert1, cert2];

      const result = sortCertifications(certs);
      expect(result.length).toEqual(2);
      expect(result).toEqual([cert1, cert2]);
    });
  });

  describe("getVisibleCertifications", () => {
    it("returns an empty array when business is undefined", () => {
      const certifications = [generateCertification({})];
      expect(getVisibleCertifications(certifications, undefined).length).toEqual(0);
    });

    it("returns an array of all certifications when there is no matching id in hiddenCertificationIds", () => {
      const business = generateBusiness({
        preferences: generatePreferences({ hiddenCertificationIds: ["three"] }),
      });
      const certifications = [generateCertification({ id: "one" }), generateCertification({ id: "two" })];

      expect(getVisibleCertifications(certifications, business)).toEqual(certifications);
    });

    it("returns an array of filtered certifications when there is a matching id in hiddenCertificationIds", () => {
      const business = generateBusiness({
        preferences: generatePreferences({ hiddenCertificationIds: ["two"] }),
      });

      const cert1 = generateCertification({ id: "one" });
      const cert2 = generateCertification({ id: "two" });

      expect(getVisibleCertifications([cert1, cert2], business)).toEqual([cert1]);
    });
  });

  describe("sortFundings", () => {
    it("sorts fundings by status first then alphabetically", () => {
      const userData = generateUserData({});

      const funding1 = generateFunding({ name: "Bca", status: "deadline" });
      const funding2 = generateFunding({ name: "Abc", status: "deadline" });
      const funding3 = generateFunding({ name: "cba", status: "deadline" });
      const funding4 = generateFunding({ name: "abc", status: "first come, first serve" });
      const funding5 = generateFunding({ name: "bca", status: "rolling application" });
      const fundings = [funding5, funding2, funding3, funding1, funding4];

      const result = sortFundings(fundings, userData);
      expect(result.length).toEqual(5);
      expect(result).toEqual([funding2, funding1, funding3, funding4, funding5]);
    });

    it("does not change the sorting if the names are the same", () => {
      const funding1 = generateFunding({
        name: "bca",
        status: "deadline",
        certifications: [randomFundingCertification()],
      });
      const funding2 = generateFunding({
        name: "bca",
        status: "deadline",
        certifications: [randomFundingCertification()],
      });
      const fundings = [funding1, funding2];

      const result = sortFundings(fundings);
      expect(result.length).toEqual(2);
      expect(result).toEqual([funding1, funding2]);
    });

    describe("agencyFundingSorting", () => {
      it("maintains previous sorting but bubbles fundings from agencySource to top", () => {
        const userData = generateUserData({
          user: generateUser({
            accountCreationSource: "investNewark",
          }),
        });
        const funding1 = generateFunding({
          name: "Bca",
          status: "deadline",
          agency: ["fakeAgency"],
        });
        const funding2 = generateFunding({
          name: "Abc",
          status: "deadline",
          agency: ["fakeAgency"],
        });
        const funding3 = generateFunding({
          name: "cba",
          status: "deadline",
          agency: ["invest-newark"],
        });
        const funding4 = generateFunding({
          name: "abc",
          status: "first come, first serve",
          agency: ["fakeAgency"],
        });
        const funding5 = generateFunding({
          name: "bca",
          status: "rolling application",
          agency: ["invest-newark"],
        });
        const fundings = [funding5, funding2, funding3, funding1, funding4];

        const result = sortFundings(fundings, userData);
        expect(result.length).toEqual(5);
        expect(result).toEqual([funding3, funding5, funding2, funding1, funding4]);
      });

      it("does not change the sorting if no matching agencies found", () => {
        const userData = generateUserData({
          user: generateUser({
            accountCreationSource: "InvestNewark",
          }),
        });
        const funding1 = generateFunding({ name: "Bca", status: "deadline" });
        const funding2 = generateFunding({ name: "Abc", status: "deadline", agency: ["fakeAgency"] });
        const funding3 = generateFunding({ name: "cba", status: "deadline", agency: ["testAgency"] });
        const funding4 = generateFunding({ name: "abc", status: "first come, first serve" });
        const funding5 = generateFunding({
          name: "bca",
          status: "rolling application",
          agency: ["testAgency"],
        });
        const fundings = [funding5, funding2, funding3, funding1, funding4];

        const result = sortFundings(fundings, userData);
        expect(result.length).toEqual(5);
        expect(result).toEqual([funding2, funding1, funding3, funding4, funding5]);
      });

      it("does not change the sorting if empty string passed for agencyName, even if that is matched", () => {
        const userData = generateUserData({
          user: generateUser({
            accountCreationSource: "fake-source",
          }),
        });
        const funding1 = generateFunding({ name: "Bca", status: "deadline" });
        const funding2 = generateFunding({ name: "Abc", status: "deadline", agency: ["fakeAgency"] });
        const funding3 = generateFunding({ name: "cba", status: "deadline", agency: ["testAgency", ""] });
        const funding4 = generateFunding({ name: "abc", status: "first come, first serve" });
        const funding5 = generateFunding({
          name: "bca",
          status: "rolling application",
          agency: [""],
        });
        const fundings = [funding5, funding2, funding3, funding1, funding4];

        const result = sortFundings(fundings, userData);
        expect(result.length).toEqual(5);
        expect(result).toEqual([funding2, funding1, funding3, funding4, funding5]);
      });

      it("does not change the sorting if all fundings from same agency", () => {
        const userData = generateUserData({
          user: generateUser({
            accountCreationSource: "investNewark",
          }),
        });
        const funding1 = generateFunding({ name: "Bca", status: "deadline", agency: ["invest-newark"] });
        const funding2 = generateFunding({ name: "Abc", status: "deadline", agency: ["invest-newark"] });
        const funding3 = generateFunding({ name: "cba", status: "deadline", agency: ["invest-newark"] });
        const funding4 = generateFunding({
          name: "abc",
          status: "first come, first serve",
          agency: ["invest-newark"],
        });
        const funding5 = generateFunding({
          name: "bca",
          status: "rolling application",
          agency: ["invest-newark"],
        });
        const fundings = [funding5, funding2, funding3, funding1, funding4];

        const result = sortFundings(fundings, userData);
        expect(result.length).toEqual(5);
        expect(result).toEqual([funding2, funding1, funding3, funding4, funding5]);
      });
    });
  });

  describe("getVisibleSideBarCards", () => {
    it("should return an empty array if business is undefined", () => {
      const sidebarDisplayContent: Record<string, SidebarCardContent> = {};
      const result = getVisibleSideBarCards(undefined, sidebarDisplayContent);
      expect(result).toEqual([]);
    });

    it("should return an empty array if sidebarDisplayContent is undefined", () => {
      const business = generateBusiness({
        preferences: generatePreferences({ visibleSidebarCards: ["some-id"] }),
      });
      const result = getVisibleSideBarCards(business, undefined);
      expect(result).toEqual([]);
    });

    it("should return array with matching id", () => {
      const business = generateBusiness({
        preferences: generatePreferences({ visibleSidebarCards: ["some-id"] }),
      });
      const sidebarCardContent = generateSidebarCardContent({
        id: "some-id",
      });

      const result = getVisibleSideBarCards(business, {
        "some-id": sidebarCardContent,
      });
      expect(result).toEqual([sidebarCardContent]);
    });
  });

  describe("getVisibleFundings", () => {
    it("returns an empty array when business is undefined", () => {
      const fundings = [generateFunding({})];
      expect(getVisibleFundings(fundings, undefined).length).toEqual(0);
    });

    it("returns an array of all fundings when there is no matching id in hiddenFundingIds", () => {
      const business = generateBusiness({
        preferences: generatePreferences({ hiddenFundingIds: ["three"] }),
      });
      const fundings = [generateFunding({ id: "one" }), generateFunding({ id: "two" })];

      expect(getVisibleFundings(fundings, business)).toEqual(fundings);
    });

    it("returns an array of filtered fundings when there is a matching id in hiddenFundingIds", () => {
      const business = generateBusiness({
        preferences: generatePreferences({ hiddenFundingIds: ["two"] }),
      });
      const funding1 = generateFunding({ id: "one" });
      const funding2 = generateFunding({ id: "two" });

      expect(getVisibleFundings([funding1, funding2], business)).toEqual([funding1]);
    });
  });

  describe("getHiddenFundings", () => {
    it("returns an empty array when business is undefined", () => {
      const fundings = [generateFunding({})];
      expect(getHiddenFundings(undefined, fundings).length).toEqual(0);
    });

    it("returns hidden fundings when there is a match", () => {
      const business = generateBusiness({
        preferences: generatePreferences({ hiddenFundingIds: ["three"] }),
      });
      const funding = generateFunding({ id: "three" });
      expect(getHiddenFundings(business, [funding]).length).toEqual(1);
      expect(getHiddenFundings(business, [funding])).toEqual([funding]);
    });
  });

  describe("getForYouCardCount", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        operatingPhase: OperatingPhaseId.GUEST_MODE_OWNING,
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

  describe("filterFundings", () => {
    it("returns an empty array when business is undefined", () => {
      const funding = generateFunding({});
      const result = filterFundings({ fundings: [funding] });
      expect(result.length).toEqual(0);
    });

    it("returns an empty array when funding is undefined", () => {
      const business = generateBusiness({});
      const result = filterFundings({ business });
      expect(result.length).toEqual(0);
    });

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
      const result = filterFundings({ fundings, business });
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

      const result = filterFundings({ fundings, business });
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

        const result = filterFundings({ fundings, business });
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

        const result = filterFundings({ fundings, business });
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

      const result = filterFundings({ fundings, business });
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

      const result = filterFundings({ fundings, business });
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

      const result = filterFundings({ fundings, business });
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

        const result = filterFundings({ fundings, business });
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

        const result = filterFundings({ fundings, business });
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

        const result = filterFundings({ fundings, business });
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

        const result = filterFundings({ fundings, business });
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
      const funding3 = generateFunding({
        sector: ["construction", "cannabis"],
        status: "rolling application",
      });
      const funding4 = generateFunding({
        sector: ["cannabis", "manufacturing"],
        status: "rolling application",
      });
      const funding5 = generateFunding({ sector: ["Construction"], status: "rolling application" });
      const fundings = [funding1, funding2, funding3, funding4, funding5];

      const result = filterFundings({ fundings, business });
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

        const result = filterFundings({ fundings: [funding8], business });
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

        const result = filterFundings({ fundings: listOfFundingTypes, business });
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

        const result = filterFundings({ fundings: listOfFundingTypes, business });
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

        const result = filterFundings({ fundings: listOfFundingTypes, business });
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

        const result = filterFundings({ fundings: [funding], business });
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

        const result = filterFundings({ fundings: [funding], business });
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

        const result = filterFundings({ fundings: [funding], business });
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

      const result = filterFundings({ fundings: [funding], business });
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

      const result = filterFundings({ fundings: [funding], business });
      expect(result.length).toEqual(1);
      expect(result).toEqual(expect.arrayContaining([funding]));
    });
  });

  describe("filterCertifications", () => {
    const businessWithDefaultProfileData = (overrides: Partial<ProfileData>): Business => {
      return generateBusiness({
        profileData: generateProfileData({
          ownershipTypeIds: [],
          existingEmployees: String(SMALL_BUSINESS_MAX_EMPLOYEE_COUNT),
          ...overrides,
        }),
      });
    };

    it("returns an empty array when business is undefined", () => {
      const cert1 = generateCertification({});
      const results = filterCertifications({ certifications: [cert1] });
      expect(results.length).toEqual(0);
    });

    it("returns an empty array when certifications is undefined", () => {
      const business = businessWithDefaultProfileData({});
      const results = filterCertifications({ business });
      expect(results.length).toEqual(0);
    });

    it("returns filtered certifications for veteran-owned", () => {
      const business = businessWithDefaultProfileData({ ownershipTypeIds: ["veteran-owned"] });

      const cert1 = generateCertification({ applicableOwnershipTypes: ["veteran-owned"] });
      const cert2 = generateCertification({ applicableOwnershipTypes: ["minority-owned"] });
      const cert3 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran"] });
      const cert4 = generateCertification({
        applicableOwnershipTypes: ["disabled-veteran", "veteran-owned"],
      });
      const cert5 = generateCertification({ applicableOwnershipTypes: [] });
      const results = filterCertifications({ certifications: [cert1, cert2, cert3, cert4, cert5], business });
      expect(results.length).toEqual(3);
      expect(results).toEqual(expect.arrayContaining([cert1, cert4, cert5]));
    });

    it("returns filtered certifications for disabled-veteran", () => {
      const business = businessWithDefaultProfileData({ ownershipTypeIds: ["disabled-veteran"] });

      const cert1 = generateCertification({ applicableOwnershipTypes: ["veteran-owned"] });
      const cert2 = generateCertification({ applicableOwnershipTypes: ["minority-owned"] });
      const cert3 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran"] });
      const cert4 = generateCertification({
        applicableOwnershipTypes: ["disabled-veteran", "veteran-owned"],
      });
      const cert5 = generateCertification({ applicableOwnershipTypes: [] });

      const results = filterCertifications({ certifications: [cert1, cert2, cert3, cert4, cert5], business });
      expect(results.length).toEqual(3);
      expect(results).toEqual(expect.arrayContaining([cert3, cert4, cert5]));
    });

    it("returns filtered certifications for disabled-veteran / veteran-owned combo", () => {
      const business = businessWithDefaultProfileData({
        ownershipTypeIds: ["veteran-owned", "disabled-veteran"],
      });

      const cert1 = generateCertification({ applicableOwnershipTypes: ["veteran-owned"] });
      const cert2 = generateCertification({ applicableOwnershipTypes: ["minority-owned"] });
      const cert3 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran"] });
      const cert4 = generateCertification({
        applicableOwnershipTypes: ["disabled-veteran", "veteran-owned"],
      });
      const cert5 = generateCertification({ applicableOwnershipTypes: ["minority-owned", "veteran-owned"] });
      const cert6 = generateCertification({ applicableOwnershipTypes: [] });

      const results = filterCertifications({
        certifications: [cert1, cert2, cert3, cert4, cert5, cert6],
        business,
      });
      expect(results.length).toEqual(5);
      expect(results).toEqual(expect.arrayContaining([cert1, cert3, cert4, cert5, cert6]));
    });

    it("returns filtered certifications for none ownership types", () => {
      const business = businessWithDefaultProfileData({ ownershipTypeIds: ["none"] });

      const cert1 = generateCertification({ applicableOwnershipTypes: ["veteran-owned"] });
      const cert2 = generateCertification({ applicableOwnershipTypes: ["minority-owned"] });
      const cert3 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran"] });
      const cert4 = generateCertification({
        applicableOwnershipTypes: ["disabled-veteran", "veteran-owned"],
      });
      const cert5 = generateCertification({ applicableOwnershipTypes: [] });

      const results = filterCertifications({
        certifications: [cert1, cert2, cert3, cert4, cert5],
        business,
      });
      expect(results.length).toEqual(1);
      expect(results).toEqual(expect.arrayContaining([cert5]));
    });

    it("returns all certifications for empty ownership types", () => {
      const business = businessWithDefaultProfileData({ ownershipTypeIds: [] });

      const cert1 = generateCertification({ applicableOwnershipTypes: ["veteran-owned"] });
      const cert2 = generateCertification({ applicableOwnershipTypes: ["minority-owned"] });
      const cert3 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran"] });
      const cert4 = generateCertification({
        applicableOwnershipTypes: ["disabled-veteran", "veteran-owned"],
      });
      const cert5 = generateCertification({ applicableOwnershipTypes: [] });

      const results = filterCertifications({
        certifications: [cert1, cert2, cert3, cert4, cert5],
        business,
      });
      expect(results.length).toEqual(5);
      expect(results).toEqual(expect.arrayContaining([cert1, cert2, cert3, cert4, cert5]));
    });

    it("returns filtered certification when number of employees is less than 120", () => {
      const business = businessWithDefaultProfileData({
        existingEmployees: String(SMALL_BUSINESS_MAX_EMPLOYEE_COUNT - 1),
      });

      const cert1 = generateCertification({ isSbe: true, applicableOwnershipTypes: [] });
      const results = filterCertifications({
        certifications: [cert1],
        business,
      });
      expect(results.length).toEqual(1);
      expect(results).toEqual(expect.arrayContaining([cert1]));
    });

    it("returns filtered certification when number of employees is not answered", () => {
      const business = businessWithDefaultProfileData({ existingEmployees: undefined });

      const cert1 = generateCertification({ isSbe: true, applicableOwnershipTypes: [] });
      const results = filterCertifications({
        certifications: [cert1],
        business,
      });
      expect(results.length).toEqual(1);
      expect(results).toEqual(expect.arrayContaining([cert1]));
    });

    it("returns empty filtered certifications when number of employees is greater than or equal to 120", () => {
      const business = businessWithDefaultProfileData({});

      const cert1 = generateCertification({ isSbe: true });
      const results = filterCertifications({
        certifications: [cert1],
        business,
      });
      expect(results.length).toEqual(0);
      expect(results).toEqual(expect.not.arrayContaining([cert1]));
    });

    it("returns filtered certifications for disabled-veteran / veteran-owned combo and SBE Certification", () => {
      const business = businessWithDefaultProfileData({
        ownershipTypeIds: ["veteran-owned", "disabled-veteran"],
        existingEmployees: String(SMALL_BUSINESS_MAX_EMPLOYEE_COUNT - 1),
      });

      const cert1 = generateCertification({ applicableOwnershipTypes: ["veteran-owned"] });
      const cert2 = generateCertification({ applicableOwnershipTypes: ["minority-owned"] });
      const cert3 = generateCertification({ applicableOwnershipTypes: ["disabled-veteran"] });
      const cert4 = generateCertification({
        applicableOwnershipTypes: ["disabled-veteran", "veteran-owned"],
      });
      const cert5 = generateCertification({ applicableOwnershipTypes: ["minority-owned", "veteran-owned"] });
      const cert6 = generateCertification({ isSbe: true, applicableOwnershipTypes: [] });
      const cert7 = generateCertification({
        isSbe: true,
        applicableOwnershipTypes: ["minority-owned"],
      });
      const cert8 = generateCertification({
        isSbe: true,
        applicableOwnershipTypes: ["veteran-owned"],
      });
      const cert9 = generateCertification({ applicableOwnershipTypes: [] });

      const results = filterCertifications({
        certifications: [cert1, cert2, cert3, cert4, cert5, cert6, cert7, cert8, cert9],
        business,
      });
      expect(results.length).toEqual(7);
      expect(results).toEqual(expect.arrayContaining([cert1, cert3, cert4, cert5, cert6, cert8, cert9]));
    });
  });
});
