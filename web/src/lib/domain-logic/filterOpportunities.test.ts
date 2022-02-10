import { filterOpportunities } from "@/lib/domain-logic/filterOpportunities";
import {
  generateMunicipality,
  generateOpportunity,
  generateProfileData,
  generateUserData,
} from "@/test/factories";

describe("filterOpportunities", () => {
  it("shows home-based-business yes or unknown when user home-based-business is true", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: true,
        municipality: undefined,
        existingEmployees: "1",
        sectorId: undefined,
      }),
    });
    const opp1 = generateOpportunity({ homeBased: "yes" });
    const opp2 = generateOpportunity({ homeBased: "no" });
    const opp3 = generateOpportunity({ homeBased: "unknown" });
    const opportunities = [opp1, opp2, opp3];

    const result = filterOpportunities(opportunities, userData);
    expect(result.length).toEqual(2);
    expect(result).toEqual(expect.arrayContaining([opp1, opp3]));
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
    const opp1 = generateOpportunity({ homeBased: "yes" });
    const opp2 = generateOpportunity({ homeBased: "no" });
    const opp3 = generateOpportunity({ homeBased: "unknown" });
    const opportunities = [opp1, opp2, opp3];

    const result = filterOpportunities(opportunities, userData);
    expect(result.length).toEqual(3);
    expect(result).toEqual(expect.arrayContaining([opp1, opp2, opp3]));
  });

  it("shows opportunities where user municipality is in specified county", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: generateMunicipality({ county: "Atlantic" }),
        sectorId: undefined,
        existingEmployees: "1",
      }),
    });

    const opp1 = generateOpportunity({ county: ["Atlantic"] });
    const opp2 = generateOpportunity({ county: [] });
    const opp3 = generateOpportunity({ county: ["Bergen", "Atlantic"] });
    const opp4 = generateOpportunity({ county: ["Bergen", "Camden"] });
    const opp5 = generateOpportunity({ county: ["All"] });
    const opp6 = generateOpportunity({ county: ["All", "Camden"] });
    const opportunities = [opp1, opp2, opp3, opp4, opp5, opp6];

    const result = filterOpportunities(opportunities, userData);
    expect(result.length).toEqual(5);
    expect(result).toEqual(expect.arrayContaining([opp1, opp2, opp3, opp5, opp6]));
  });

  it("does not display any opportunities marked as Do Not Publish", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "1",
        sectorId: undefined,
      }),
    });
    const opp1 = generateOpportunity({ publishStageArchive: "Do Not Publish" });
    const opp2 = generateOpportunity({ publishStageArchive: null });
    const opportunities = [opp1, opp2];

    const result = filterOpportunities(opportunities, userData);
    expect(result.length).toEqual(1);
    expect(result).toEqual(expect.arrayContaining([opp2]));
  });

  it('displays only opportunities with businessSize "n/a" when # employees is 0', () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "0",
        sectorId: undefined,
      }),
    });
    const opp1 = generateOpportunity({ businessSize: "n/a" });
    const opp2 = generateOpportunity({ businessSize: "yes" });
    const opportunities = [opp1, opp2];

    const result = filterOpportunities(opportunities, userData);
    expect(result.length).toEqual(1);
    expect(result).toEqual(expect.arrayContaining([opp1]));
  });

  it('displays only opportunities with businessSize "n/a" when # employees is equivalent to 0', () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "00",
        sectorId: undefined,
      }),
    });
    const opp1 = generateOpportunity({ businessSize: "n/a" });
    const opp2 = generateOpportunity({ businessSize: "yes" });
    const opportunities = [opp1, opp2];

    const result = filterOpportunities(opportunities, userData);
    expect(result.length).toEqual(1);
    expect(result).toEqual(expect.arrayContaining([opp1]));
  });

  it("displays all opportunities when # employees > 0", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "0123",
        sectorId: undefined,
      }),
    });
    const opp1 = generateOpportunity({ businessSize: "n/a" });
    const opp2 = generateOpportunity({ businessSize: "yes" });
    const opportunities = [opp1, opp2];

    const result = filterOpportunities(opportunities, userData);
    expect(result.length).toEqual(2);
    expect(result).toEqual(expect.arrayContaining([opp1, opp2]));
  });

  it("shows opportunities where user sector is in specified sectors list", () => {
    const userData = generateUserData({
      profileData: generateProfileData({
        homeBasedBusiness: false,
        municipality: undefined,
        existingEmployees: "1",
        sectorId: "construction",
      }),
    });

    const opp1 = generateOpportunity({ industry: ["construction"] });
    const opp2 = generateOpportunity({ industry: [] });
    const opp3 = generateOpportunity({ industry: ["construction", "cannabis"] });
    const opp4 = generateOpportunity({ industry: ["cannabis", "manufacturing"] });
    const opportunities = [opp1, opp2, opp3, opp4];

    const result = filterOpportunities(opportunities, userData);
    expect(result.length).toEqual(3);
    expect(result).toEqual(expect.arrayContaining([opp1, opp2, opp3]));
  });
});
