import {
  generatev173Business,
  generatev173ProfileData,
  generatev173UserData,
} from "@db/migrations/v173_add_school_bus_passenger_transport";
import { migrate_v173_to_v174 } from "@db/migrations/v174_add_public_works_contractor";

describe("migrate_v173_to_v174", () => {
  it("sets publicWorksContractor to false when constructionType is BOTH", () => {
    const id = "biz-1";
    const v173UserData = generatev173UserData({
      businesses: {
        id: generatev173Business({
          id,
          profileData: generatev173ProfileData({ constructionType: "BOTH" }),
        }),
      },
    });

    const v174UserData = migrate_v173_to_v174(v173UserData);
    expect(v174UserData.version).toBe(174);
    expect(v174UserData.businesses[id].version).toBe(174);
    expect(v174UserData.businesses[id].profileData.publicWorksContractor).toBeFalsy();
  });

  it("sets publicWorksContractor to false when constructionType is COMMERCIAL_OR_INDUSTRIAL", () => {
    const id = "biz-1";
    const v173UserData = generatev173UserData({
      businesses: {
        id: generatev173Business({
          id,
          profileData: generatev173ProfileData({ constructionType: "COMMERCIAL_OR_INDUSTRIAL" }),
        }),
      },
    });

    const v174UserData = migrate_v173_to_v174(v173UserData);
    expect(v174UserData.version).toBe(174);
    expect(v174UserData.businesses[id].version).toBe(174);
    expect(v174UserData.businesses[id].profileData.publicWorksContractor).toBeFalsy();
  });

  it("sets publicWorksContractor to undefined", () => {
    const id = "biz-1";
    const v173UserData = generatev173UserData({
      businesses: {
        id: generatev173Business({
          id,
          profileData: generatev173ProfileData({ constructionType: undefined }),
        }),
      },
    });

    const v174UserData = migrate_v173_to_v174(v173UserData);
    expect(v174UserData.version).toBe(174);
    expect(v174UserData.businesses[id].version).toBe(174);
    expect(v174UserData.businesses[id].profileData.publicWorksContractor).toBeUndefined();
  });
});
