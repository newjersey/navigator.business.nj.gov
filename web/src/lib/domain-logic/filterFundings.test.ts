import { filterFundings } from "@/lib/domain-logic/filterFundings";
import {
  generateFunding,
  generateMunicipality,
  generateProfileData,
  generateUserData,
} from "@/test/factories";

describe("filterFundings", () => {
  it("shows home-based-business yes or unknown when user home-based-business is true", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: true,
        municipality: undefined,
        existingEmployees: "0",
        sectorId: undefined,
      }),
    });
    const funding1 = generateFunding({ homeBased: "yes", employeesRequired: "n/a", status: "open" });
    const funding2 = generateFunding({ homeBased: "no", employeesRequired: "n/a", status: "open" });
    const funding3 = generateFunding({ homeBased: "unknown", employeesRequired: "n/a", status: "open" });
    const funding4 = generateFunding({ homeBased: "yes", employeesRequired: "50", status: "open" });
    const funding5 = generateFunding({
      homeBased: "yes",
      employeesRequired: "n/a",
      publishStageArchive: "Do Not Publish",
    });
    const fundings = [funding1, funding2, funding3, funding4, funding5];
    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(2);
    expect(result).toEqual(expect.arrayContaining([funding1, funding3]));
  });

  it("shows all when user home-based-business is false", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "0",
        sectorId: undefined,
      }),
    });
    const funding1 = generateFunding({ homeBased: "yes", employeesRequired: "n/a", status: "open" });
    const funding2 = generateFunding({ homeBased: "no", employeesRequired: "n/a", status: "open" });
    const funding3 = generateFunding({ homeBased: "unknown", employeesRequired: "n/a", status: "open" });
    const funding4 = generateFunding({ homeBased: "yes", employeesRequired: "50", status: "open" });
    const funding5 = generateFunding({
      homeBased: "yes",
      employeesRequired: "n/a",
      publishStageArchive: "Do Not Publish",
    });
    const fundings = [funding1, funding2, funding3, funding4, funding5];

    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(3);
    expect(result).toEqual(expect.arrayContaining([funding1, funding2, funding3]));
  });

  it("shows fundings where user municipality is in specified county", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: generateMunicipality({ county: "Atlantic" }),
        sectorId: undefined,
        existingEmployees: "1",
      }),
    });

    const funding1 = generateFunding({ county: ["Atlantic"], status: "open" });
    const funding2 = generateFunding({ county: [], status: "open" });
    const funding3 = generateFunding({ county: ["Bergen", "Atlantic"], status: "open" });
    const funding4 = generateFunding({ county: ["Bergen", "Camden"], status: "open" });
    const funding5 = generateFunding({ county: ["All"], status: "open" });
    const funding6 = generateFunding({ county: ["All", "Camden"], status: "open" });
    const funding7 = generateFunding({
      county: ["All", "Camden"],
      status: "open",
      publishStageArchive: "Do Not Publish",
    });
    const fundings = [funding1, funding2, funding3, funding4, funding5, funding6, funding7];

    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(5);
    expect(result).toEqual(expect.arrayContaining([funding1, funding2, funding3, funding5, funding6]));
  });

  it("does not display any fundings marked as Do Not Publish", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "1",
        sectorId: undefined,
      }),
    });
    const funding1 = generateFunding({
      employeesRequired: "n/a",
      status: "open",
      publishStageArchive: "Do Not Publish",
    });
    const funding2 = generateFunding({ employeesRequired: "n/a", status: "open", publishStageArchive: null });
    const funding3 = generateFunding({
      employeesRequired: "200",
      status: "open",
      publishStageArchive: "Do Not Publish",
    });
    const fundings = [funding1, funding2, funding3];

    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(1);
    expect(result).toEqual(expect.arrayContaining([funding2]));
  });

  it('displays only fundings with employeesRequired "n/a" when # employees is 0', () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "0",
        sectorId: undefined,
      }),
    });
    const funding1 = generateFunding({ employeesRequired: "n/a", status: "open" });
    const funding2 = generateFunding({ employeesRequired: "yes", status: "open" });
    const funding3 = generateFunding({
      employeesRequired: "n/a",
      status: "open",
      publishStageArchive: "Do Not Publish",
    });
    const fundings = [funding1, funding2, funding3];

    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(1);
    expect(result).toEqual(expect.arrayContaining([funding1]));
  });

  it('displays only fundings with employeesRequired "n/a" when # employees is equivalent to 0', () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "00",
        sectorId: undefined,
      }),
    });
    const funding1 = generateFunding({ employeesRequired: "n/a", status: "open" });
    const funding2 = generateFunding({ employeesRequired: "yes", status: "open" });
    const funding3 = generateFunding({ employeesRequired: "n/a", status: "open", publishStageArchive: null });
    const fundings = [funding1, funding2, funding3];

    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(2);
    expect(result).toEqual(expect.arrayContaining([funding1, funding3]));
  });

  it("displays all fundings when # employees > 0", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "0123",
        sectorId: undefined,
      }),
    });
    const funding1 = generateFunding({ employeesRequired: "n/a", status: "open" });
    const funding2 = generateFunding({ employeesRequired: "yes", status: "open" });
    const fundings = [funding1, funding2];

    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(2);
    expect(result).toEqual(expect.arrayContaining([funding1, funding2]));
  });

  it("shows fundings where user sector is in specified sectors list", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "1",
        sectorId: "construction",
      }),
    });

    const funding1 = generateFunding({ sector: ["construction"], status: "open" });
    const funding2 = generateFunding({ sector: [] });
    const funding3 = generateFunding({ sector: ["construction", "cannabis"], status: "open" });
    const funding4 = generateFunding({ sector: ["cannabis", "manufacturing"], status: "open" });
    const funding5 = generateFunding({ sector: ["Construction"], status: "open" });
    const fundings = [funding1, funding2, funding3, funding4, funding5];

    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(4);
    expect(result).toEqual(expect.arrayContaining([funding1, funding2, funding3]));
  });

  it("sorts fundings by status first then alphabetically", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: generateMunicipality({ county: "Atlantic" }),
        sectorId: undefined,
        existingEmployees: "1",
      }),
    });

    const funding1 = generateFunding({ county: [], name: "bca", status: "deadline" });
    const funding2 = generateFunding({ county: [], name: "abc", status: "deadline" });
    const funding3 = generateFunding({ county: [], name: "cba", status: "deadline" });
    const funding4 = generateFunding({ county: [], name: "abc", status: "first-come, first-served" });
    const funding5 = generateFunding({ county: [], name: "cba", status: "closed" });
    const funding6 = generateFunding({ county: [], name: "bca", status: "open" });
    const fundings = [funding6, funding2, funding5, funding3, funding1, funding4];

    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(5);
    expect(result).toEqual([funding2, funding1, funding3, funding4, funding6]);
  });
});
