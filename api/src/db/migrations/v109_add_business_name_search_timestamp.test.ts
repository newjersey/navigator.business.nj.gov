import {
  generateV108FormationData,
  generateV108UserData,
} from "@db/migrations/v108_add_business_name_search_to_formation_data";
import { migrate_v108_to_v109 } from "@db/migrations/v109_add_business_name_search_timestamp";

describe("migrate_v108_to_v109", () => {
  it("adds a lastUpdatedTimeStamp of Jan 1st 2000 for users who have businessNameSearch data", () => {
    const v108 = generateV108UserData({
      formationData: generateV108FormationData(
        {
          businessNameSearch: {
            businessNameAvailability: {
              status: "AVAILABLE",
              similarNames: [],
            },
          },
        },
        "LLC"
      ),
    });
    const v109 = migrate_v108_to_v109(v108);
    expect(v109).toEqual({
      ...v108,
      formationData: {
        ...v108.formationData,
        businessNameAvailability: {
          ...v108.formationData.businessNameSearch?.businessNameAvailability,
          lastUpdatedTimeStamp: "2000-01-01T00:00:00.000Z",
        },
      },
      version: 109,
    });
  });

  it("only updates the version number for users who don't have businessNameSearch data", () => {
    const v108 = generateV108UserData({
      formationData: generateV108FormationData({ businessNameSearch: undefined }, "LLC"),
    });
    const v109 = migrate_v108_to_v109(v108);
    expect(v109).toEqual({
      ...v108,
      version: 109,
    });
  });
});
