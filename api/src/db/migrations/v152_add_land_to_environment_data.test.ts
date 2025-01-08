import {
  generatev151Business,
  generatev151UserData,
  generatev151WasteData,
  generatev151WasteQuestionnaireData,
} from "@db/migrations/v151_extract_business_data";
import { migrate_v151_to_v152, v152EnvironmentData } from "@db/migrations/v152_add_land_to_environment_data";

describe("v152_add_land_to_environment_data", () => {
  it("migrates environment data when waste task is COMPLETED", () => {
    const id = "biz-1";
    const v151Business = generatev151Business({
      taskProgress: { "waste-permitting": "COMPLETED" },
      environmentData: {
        waste: generatev151WasteData({
          questionnaireData: generatev151WasteQuestionnaireData({
            hazardousMedicalWaste: false,
            constructionDebris: true,
            compostWaste: true,
            treatProcessWaste: false,
            noWaste: false,
          }),
          submitted: true,
        }),
      },
      id,
    });
    const v151User = generatev151UserData({
      businesses: { "biz-1": v151Business },
    });

    const v152User = migrate_v151_to_v152(v151User);

    expect(v152User.businesses[id].environmentData?.waste?.questionnaireData).toEqual({
      hazardousMedicalWaste: false,
      constructionDebris: true,
      compostWaste: true,
      treatProcessWaste: false,
      noWaste: false,
    });
    expect(v152User.businesses[id].environmentData?.waste?.submitted).toEqual(true);
    expect(v152User.businesses[id].taskProgress["waste-permitting"]).toEqual("COMPLETED");
  });

  it("migrates environment data when waste task is IN_PROGRESS", () => {
    const id = "biz-1";
    const v151Business = generatev151Business({
      taskProgress: { "waste-permitting": "IN_PROGRESS" },
      environmentData: {
        waste: generatev151WasteData({
          questionnaireData: generatev151WasteQuestionnaireData({
            hazardousMedicalWaste: false,
            constructionDebris: true,
            compostWaste: true,
            treatProcessWaste: false,
            noWaste: false,
          }),
          submitted: false,
        }),
      },
      id,
    });
    const v151User = generatev151UserData({
      businesses: { "biz-1": v151Business },
    });

    const v152User = migrate_v151_to_v152(v151User);

    expect(v152User.businesses[id].environmentData?.waste?.questionnaireData).toEqual({
      hazardousMedicalWaste: false,
      constructionDebris: true,
      compostWaste: true,
      treatProcessWaste: false,
      noWaste: false,
    });
    expect(v152User.businesses[id].environmentData?.waste?.submitted).toEqual(false);
    expect(v152User.businesses[id].taskProgress["waste-permitting"]).toEqual("IN_PROGRESS");
  });

  it("adds land section to environment data", () => {
    const id = "biz-1";
    const v151Business = generatev151Business({
      taskProgress: { "waste-permitting": "IN_PROGRESS" },
      environmentData: {
        waste: generatev151WasteData({}),
      },
      id,
    });
    const v151User = generatev151UserData({
      businesses: { "biz-1": v151Business },
    });
    const v152User = migrate_v151_to_v152(v151User);
    const environmentData = v152User.businesses[id].environmentData as v152EnvironmentData;
    expect("land" in environmentData).toEqual(true);
  });
});
