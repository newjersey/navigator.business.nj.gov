import {
  generatev166Business,
  generatev166FormationData,
  generatev166FormationFormData,
  generatev166UserData,
} from "@db/migrations/v166_add_roadmap_task_data";
import { migrate_v166_to_v167 } from "@db/migrations/v167_update_agent_number_or_manual_options";

describe("migrate_v166_to_v167", () => {
  it("migrates agentNumberOrManual from NUMBER to PROFESSIONAL_SERVICE", async () => {
    const id = "biz-1";
    const v166UserData = generatev166UserData({
      businesses: {
        id: generatev166Business({
          id,
          formationData: generatev166FormationData(
            {
              formationFormData: generatev166FormationFormData(
                {
                  agentNumberOrManual: "NUMBER",
                },
                "limited-liability-partnership",
              ),
            },
            "limited-liability-partnership",
          ),
        }),
      },
    });

    const v167UserData = migrate_v166_to_v167(v166UserData);
    expect(v167UserData.version).toBe(167);
    expect(v167UserData.businesses[id].version).toBe(167);
    expect(v167UserData.businesses[id].formationData.formationFormData.agentType).toBe(
      "PROFESSIONAL_SERVICE",
    );
  });

  it("migrates agentNumberOrManual from MANUAL_ENTRY to MYSELF", async () => {
    const id = "biz-1";
    const v166UserData = generatev166UserData({
      businesses: {
        id: generatev166Business({
          id,
          formationData: generatev166FormationData(
            {
              formationFormData: generatev166FormationFormData(
                {
                  agentNumberOrManual: "MANUAL_ENTRY",
                },
                "limited-liability-partnership",
              ),
            },
            "limited-liability-partnership",
          ),
        }),
      },
    });

    const v167UserData = migrate_v166_to_v167(v166UserData);
    expect(v167UserData.version).toBe(167);
    expect(v167UserData.businesses[id].version).toBe(167);
    expect(v167UserData.businesses[id].formationData.formationFormData.agentType).toBe("MYSELF");
  });
});
