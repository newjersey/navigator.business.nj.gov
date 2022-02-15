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
        existingEmployees: "1",
        sectorId: undefined,
      }),
    });
    const funding1 = generateFunding({ homeBased: "yes" });
    const funding2 = generateFunding({ homeBased: "no" });
    const funding3 = generateFunding({ homeBased: "unknown" });
    const fundings = [funding1, funding2, funding3];

    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(2);
    expect(result).toEqual(expect.arrayContaining([funding1, funding3]));
  });

  it("shows all when user home-based-business is false", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "1",
        sectorId: undefined,
      }),
    });
    const funding1 = generateFunding({ homeBased: "yes" });
    const funding2 = generateFunding({ homeBased: "no" });
    const funding3 = generateFunding({ homeBased: "unknown" });
    const fundings = [funding1, funding2, funding3];

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

    const funding1 = generateFunding({ county: ["Atlantic"] });
    const funding2 = generateFunding({ county: [] });
    const funding3 = generateFunding({ county: ["Bergen", "Atlantic"] });
    const funding4 = generateFunding({ county: ["Bergen", "Camden"] });
    const funding5 = generateFunding({ county: ["All"] });
    const funding6 = generateFunding({ county: ["All", "Camden"] });
    const fundings = [funding1, funding2, funding3, funding4, funding5, funding6];

    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(5);
    expect(result).toEqual(expect.arrayContaining([funding1, funding2, funding3, funding5, funding6]));
  });

  it("does not display any fundings marked as Do Not Publish", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "0",
        sectorId: undefined,
      }),
    });
    const funding1 = generateFunding({ businessSize: "n/a", publishStageArchive: "Do Not Publish" });
    const funding2 = generateFunding({ businessSize: "n/a", publishStageArchive: null });
    const fundings = [funding1, funding2];

    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(1);
    expect(result).toEqual(expect.arrayContaining([funding2]));
  });

  it('displays only fundings with businessSize "n/a" when # employees is 0', () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "0",
        sectorId: undefined,
      }),
    });
    const funding1 = generateFunding({ businessSize: "n/a" });
    const funding2 = generateFunding({ businessSize: "yes" });
    const fundings = [funding1, funding2];

    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(1);
    expect(result).toEqual(expect.arrayContaining([funding1]));
  });

  it('displays only fundings with businessSize "n/a" when # employees is equivalent to 0', () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "00",
        sectorId: undefined,
      }),
    });
    const funding1 = generateFunding({ businessSize: "n/a" });
    const funding2 = generateFunding({ businessSize: "yes" });
    const fundings = [funding1, funding2];

    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(1);
    expect(result).toEqual(expect.arrayContaining([funding1]));
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
    const funding1 = generateFunding({ businessSize: "n/a" });
    const funding2 = generateFunding({ businessSize: "yes" });
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

    const funding1 = generateFunding({ sector: ["construction"] });
    const funding2 = generateFunding({ sector: [] });
    const funding3 = generateFunding({ sector: ["construction", "cannabis"] });
    const funding4 = generateFunding({ sector: ["cannabis", "manufacturing"] });
    const funding5 = generateFunding({ sector: ["Construction"] });
    const fundings = [funding1, funding2, funding3, funding4, funding5];

    const result = filterFundings(fundings, userData);
    expect(result.length).toEqual(4);
    expect(result).toEqual(expect.arrayContaining([funding1, funding2, funding3]));
  });
});
