import { filterFundings } from "@/lib/domain-logic/filterFundings";
import { generateFunding, generateProfileData, generateUserData } from "@/test/factories";
import { generateMunicipality } from "@businessnjgovnavigator/shared/test";

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

    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(5);
    expect(result).toEqual(expect.arrayContaining([funding1, funding2, funding3, funding5, funding6]));
  });

  it("does not display any fundings with a past due due date", () => {
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
      status: "deadline",
      dueDate: "07/01/2022",
    });
    const funding2 = generateFunding({
      employeesRequired: "n/a",
      status: "rolling application",
    });

    const fundings = [funding1, funding2];

    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(1);
    expect(result).toEqual(expect.arrayContaining([funding2]));
  });

  it("displays any fundings with a due date in the future", () => {
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
      status: "deadline",
      dueDate: "07/01/2050",
    });

    const funding2 = generateFunding({
      employeesRequired: "n/a",
      status: "rolling application",
    });

    const fundings = [funding1, funding2];

    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(2);
    expect(result).toEqual(expect.arrayContaining([funding1, funding2]));
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
    const funding1 = generateFunding({ employeesRequired: "n/a", status: "rolling application" });
    const funding2 = generateFunding({ employeesRequired: "yes", status: "rolling application" });
    const funding3 = generateFunding({
      employeesRequired: "n/a",
      status: "rolling application",
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
    const funding1 = generateFunding({ employeesRequired: "n/a", status: "rolling application" });
    const funding2 = generateFunding({ employeesRequired: "yes", status: "rolling application" });
    const funding3 = generateFunding({
      employeesRequired: "n/a",
      status: "rolling application",
      publishStageArchive: null,
    });
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
    const funding1 = generateFunding({ employeesRequired: "n/a", status: "rolling application" });
    const funding2 = generateFunding({ employeesRequired: "yes", status: "rolling application" });
    const fundings = [funding1, funding2];

    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(2);
    expect(result).toEqual(expect.arrayContaining([funding1, funding2]));
  });

  it("displays all fundings when # employees is not answered", () => {
    const userData = generateUserData({
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

    const funding1 = generateFunding({ sector: ["construction"], status: "rolling application" });
    const funding2 = generateFunding({ sector: [], status: "rolling application" });
    const funding3 = generateFunding({ sector: ["construction", "cannabis"], status: "rolling application" });
    const funding4 = generateFunding({
      sector: ["cannabis", "manufacturing"],
      status: "rolling application",
    });
    const funding5 = generateFunding({ sector: ["Construction"], status: "rolling application" });
    const fundings = [funding1, funding2, funding3, funding4, funding5];

    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(4);
    expect(result).toEqual(expect.arrayContaining([funding1, funding2, funding3]));
  });
});
