import {
  generatev169Business,
  generatev169UserData,
} from "@db/migrations/v169_remove_formationformdata_contactemail";
import {
  generatev170EnvironmentQuestionnaireData,
  migrate_v169_to_v170,
} from "@db/migrations/v170_consolidate_environment_data";

describe("migrate_v169_to_v170", () => {
  it("migrates existing environment data into consolidated environment data", async () => {
    const id = "biz-1";
    const v169UserData = generatev169UserData({
      businesses: {
        [id]: generatev169Business({
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

    const v170UserData = migrate_v169_to_v170(v169UserData);
    expect(v170UserData.businesses[id].version).toBe(170);
    expect(v170UserData.version).toBe(170);
    expect(v170UserData.businesses[id].environmentData?.submitted).toBe(false);
    const updatedQuestionnaireData = generatev170EnvironmentQuestionnaireData({
      airOverrides: {
        ...v169UserData.businesses[id].environmentData?.air?.questionnaireData,
      },
      landOverrides: {
        ...v169UserData.businesses[id].environmentData?.land?.questionnaireData,
      },
      wasteOverrides: {
        ...v169UserData.businesses[id].environmentData?.waste?.questionnaireData,
      },
    });
    expect(v170UserData.businesses[id].environmentData?.questionnaireData).toStrictEqual(
      updatedQuestionnaireData,
    );
  });

  it("leaves environmentData as undefined if no air, land or waste data has been submitted", async () => {
    const id = "biz-1";
    const v169UserData = generatev169UserData({
      businesses: {
        [id]: generatev169Business({
          id,
          environmentData: undefined,
        }),
      },
    });

    const v170UserData = migrate_v169_to_v170(v169UserData);

    expect(v170UserData.businesses[id].version).toBe(170);
    expect(v170UserData.version).toBe(170);
    expect(v170UserData.businesses[id].environmentData).toBe(undefined);
  });
});
