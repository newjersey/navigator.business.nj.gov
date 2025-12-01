import {
  generatev176Business,
  generatev176UserData,
  generatev176FormationData,
  generatev176FormationFormData,
} from "@db/migrations/v176_add_check_name_reservation_options";
import { migrate_v176_to_v177 } from "@db/migrations/v177_add_business_name_confirmation";

describe("migrate_v176_to_v177", () => {
  it("if business name is not an empty string, confirmation is set to true", async () => {
    const id = "biz-1";
    const legalStructure = "limited-liability-partnership";
    const v176UserData = generatev176UserData({
      businesses: {
        id: generatev176Business({
          id,
          formationData: generatev176FormationData(
            {
              formationFormData: generatev176FormationFormData(
                { businessName: "Test Name" },
                legalStructure,
              ),
            },
            legalStructure,
          ),
        }),
      },
    });

    const v177UserData = migrate_v176_to_v177(v176UserData);
    expect(v177UserData.version).toBe(177);
    expect(
      v177UserData.businesses[id].formationData.formationFormData.businessNameConfirmation,
    ).not.toBeNull();
    expect(
      v177UserData.businesses[id].formationData.formationFormData.businessNameConfirmation,
    ).toBe(true);
  });

  it("if business name is an empty string, confirmation is set to false", async () => {
    const id = "biz-1";
    const legalStructure = "limited-liability-partnership";
    const v176UserData = generatev176UserData({
      businesses: {
        id: generatev176Business({
          id,
          formationData: generatev176FormationData(
            {
              formationFormData: generatev176FormationFormData(
                { businessName: "" },
                legalStructure,
              ),
            },
            legalStructure,
          ),
        }),
      },
    });

    const v177UserData = migrate_v176_to_v177(v176UserData);
    expect(v177UserData.version).toBe(177);
    expect(
      v177UserData.businesses[id].formationData.formationFormData.businessNameConfirmation,
    ).not.toBeNull();
    expect(
      v177UserData.businesses[id].formationData.formationFormData.businessNameConfirmation,
    ).toBe(false);
  });
});
