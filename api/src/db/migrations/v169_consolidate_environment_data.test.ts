import {
  generatev168Business,
  generatev168UserData,
} from "@db/migrations/v168_add_cigarette_license_data";
import {
  generatev169EnvironmentQuestionnaireData,
  migrate_v168_to_v169,
} from "@db/migrations/v169_consolidate_environment_data";

describe("migrate_v168_to_v169", () => {
  it("migrates existing environment data into consolidated environment data", async () => {
    const id = "biz-1";
    const v168UserData = generatev168UserData({
      businesses: {
        [id]: generatev168Business({
          id,
          environmentData: {
            air: {
              questionnaireData: {
                emitPollutants: false,
                emitEmissions: false,
                constructionActivities: false,
                noAir: true,
              },
              submitted: true,
            },
            land: {
              questionnaireData: {
                takeOverExistingBiz: false,
                propertyAssessment: false,
                constructionActivities: false,
                siteImprovementWasteLands: false,
                noLand: true,
              },
              submitted: true,
            },
            waste: {
              questionnaireData: {
                transportWaste: false,
                hazardousMedicalWaste: false,
                compostWaste: false,
                treatProcessWaste: false,
                constructionDebris: false,
                noWaste: true,
              },
              submitted: true,
            },
          },
        }),
      },
    });

    const v169UserData = migrate_v168_to_v169(v168UserData);
    expect(v169UserData.businesses[id].version).toBe(169);
    expect(v169UserData.version).toBe(169);
    expect(v169UserData.businesses[id].environmentData?.submitted).toBe(false);
    const updatedQuestionnaireData = generatev169EnvironmentQuestionnaireData({
      airOverrides: {
        ...v168UserData.businesses[id].environmentData?.air?.questionnaireData,
      },
      landOverrides: {
        ...v168UserData.businesses[id].environmentData?.land?.questionnaireData,
      },
      wasteOverrides: {
        ...v168UserData.businesses[id].environmentData?.waste?.questionnaireData,
      },
    });
    expect(v169UserData.businesses[id].environmentData?.questionnaireData).toStrictEqual(
      updatedQuestionnaireData,
    );
  });

  it("leaves environmentData as undefined if no air, land or waste data has been submitted", async () => {
    const id = "biz-1";
    const v168UserData = generatev168UserData({
      businesses: {
        [id]: generatev168Business({
          id,
          environmentData: undefined,
        }),
      },
    });

    const v169UserData = migrate_v168_to_v169(v168UserData);

    expect(v169UserData.businesses[id].version).toBe(169);
    expect(v169UserData.version).toBe(169);
    expect(v169UserData.businesses[id].environmentData).toBe(undefined);
  });
});
