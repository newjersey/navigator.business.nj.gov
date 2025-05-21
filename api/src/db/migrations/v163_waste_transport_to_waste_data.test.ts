import {
  generatev162Business,
  generatev162EnvironmentData,
  generatev162UserData,
} from "@db/migrations/v162_add_hashed_taxid_to_userdata";
import { migrate_v162_to_v163 } from "@db/migrations/v163_waste_transport_to_waste_data";

describe("v163_waste_transport_to_waste_data", () => {
  it("adds wasteTransport as false, reverts waste task progress TO_DO, and submitted to false if waste data is present", async () => {
    const id = "testId";
    const v162UserData = generatev162UserData({
      currentBusinessId: id,
      businesses: {
        [id]: generatev162Business({
          id,
          taskProgress: {
            "waste-permitting": "COMPLETED",
          },
          environmentData: generatev162EnvironmentData({
            waste: {
              questionnaireData: {
                hazardousMedicalWaste: true,
                compostWaste: false,
                treatProcessWaste: true,
                constructionDebris: true,
                noWaste: false,
              },
              submitted: true,
            },
          }),
        }),
      },
    });

    const v163UserData = await migrate_v162_to_v163(v162UserData);

    expect(v163UserData.businesses[id].environmentData?.waste?.questionnaireData).toEqual({
      transportWaste: false,
      hazardousMedicalWaste: true,
      compostWaste: false,
      treatProcessWaste: true,
      constructionDebris: true,
      noWaste: false,
    });
    expect(v163UserData.businesses[id].environmentData?.waste?.submitted).toBe(false);
    expect(v163UserData.businesses[id].taskProgress["waste-permitting"]).toBe("TO_DO");
  });

  it("doesn't make any changes if waste data is undefined", async () => {
    const id = "testId";
    const v162UserData = generatev162UserData({
      currentBusinessId: id,
      businesses: {
        [id]: generatev162Business({
          id,
          environmentData: generatev162EnvironmentData({
            waste: undefined,
            air: {
              questionnaireData: {
                emitPollutants: false,
                emitEmissions: false,
                constructionActivities: false,
                noAir: true,
              },
              submitted: true,
            },
          }),
        }),
      },
    });

    const v163UserData = await migrate_v162_to_v163(v162UserData);
    expect(v163UserData.businesses[id].environmentData).toEqual(
      v162UserData.businesses[id].environmentData,
    );
  });
});
