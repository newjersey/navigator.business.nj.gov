import {
  generatev152Business,
  generatev152LandData,
  generatev152LandQuestionnaireData,
  generatev152UserData,
} from "@db/migrations/v152_add_land_to_environment_data";
import { migrate_v152_to_v153, v153EnvironmentData } from "@db/migrations/v153_add_air_to_environment_data";

describe("v153_add_air_to_environment_data", () => {
  it("migrates environment data when land task is COMPLETED", () => {
    const id = "biz-1";
    const v152Business = generatev152Business({
      taskProgress: { "land-permitting": "COMPLETED" },
      environmentData: {
        land: generatev152LandData({
          questionnaireData: generatev152LandQuestionnaireData({
            takeOverExistingBiz: false,
            propertyAssessment: true,
            constructionActivities: true,
            siteImprovementWasteLands: false,
            noLand: false,
          }),
          submitted: true,
        }),
      },
      id,
    });
    const v152User = generatev152UserData({
      businesses: { "biz-1": v152Business },
    });

    const v153User = migrate_v152_to_v153(v152User);

    expect(v153User.businesses[id].environmentData?.land?.questionnaireData).toEqual({
      takeOverExistingBiz: false,
      propertyAssessment: true,
      constructionActivities: true,
      siteImprovementWasteLands: false,
      noLand: false,
    });
    expect(v153User.businesses[id].environmentData?.land?.submitted).toEqual(true);
    expect(v153User.businesses[id].taskProgress["land-permitting"]).toEqual("COMPLETED");
  });

  it("migrates environment data when land task is IN_PROGRESS", () => {
    const id = "biz-1";
    const v152Business = generatev152Business({
      taskProgress: { "land-permitting": "IN_PROGRESS" },
      environmentData: {
        land: generatev152LandData({
          questionnaireData: generatev152LandQuestionnaireData({
            takeOverExistingBiz: false,
            propertyAssessment: true,
            constructionActivities: true,
            siteImprovementWasteLands: false,
            noLand: false,
          }),
          submitted: false,
        }),
      },
      id,
    });
    const v152User = generatev152UserData({
      businesses: { "biz-1": v152Business },
    });

    const v153User = migrate_v152_to_v153(v152User);

    expect(v153User.businesses[id].environmentData?.land?.questionnaireData).toEqual({
      takeOverExistingBiz: false,
      propertyAssessment: true,
      constructionActivities: true,
      siteImprovementWasteLands: false,
      noLand: false,
    });
    expect(v153User.businesses[id].environmentData?.land?.submitted).toEqual(false);
    expect(v153User.businesses[id].taskProgress["land-permitting"]).toEqual("IN_PROGRESS");
  });

  it("adds air section to environment data", () => {
    const id = "biz-1";
    const v152Business = generatev152Business({
      environmentData: {
        waste: undefined,
        land: generatev152LandData({}),
      },
      id,
    });
    const v152User = generatev152UserData({
      businesses: { "biz-1": v152Business },
    });
    const v153User = migrate_v152_to_v153(v152User);
    const environmentData = v153User.businesses[id].environmentData as v153EnvironmentData;
    expect("air" in environmentData).toEqual(true);
  });
});
