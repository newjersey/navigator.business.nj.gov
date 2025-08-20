import {
  getPersonalizeTaskButtonTabValue,
  getRoadmapHeadingText,
} from "@/components/dashboard/dashboardHelpers";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/operatingPhase";
import {
  generateBusiness,
  generateProfileData,
} from "@businessnjgovnavigator/shared/test/factories";

describe("dashboardHelpers", () => {
  const Config = getMergedConfig();

  describe("getRoadmapHeadingText", () => {
    it("returns DomesticEmployerRoadmapTasksHeaderText for 'domestic-employer'", () => {
      const result = getRoadmapHeadingText("domestic-employer");
      expect(result).toBe(
        Config.dashboardRoadmapHeaderDefaults.DomesticEmployerRoadmapTasksHeaderText,
      );
    });

    it("returns RoadmapTasksHeaderText for other industries", () => {
      const result = getRoadmapHeadingText("something-else");
      expect(result).toBe(Config.dashboardRoadmapHeaderDefaults.RoadmapTasksHeaderText);
    });

    it("returns RoadmapTasksHeaderText when no industryId is passed", () => {
      const result = getRoadmapHeadingText(undefined);
      expect(result).toBe(Config.dashboardRoadmapHeaderDefaults.RoadmapTasksHeaderText);
    });
  });

  describe("getPersonalizeTaskButtonTabValue", () => {
    it("returns 'info' for undefined business", () => {
      expect(getPersonalizeTaskButtonTabValue(undefined)).toBe("info");
    });

    it("returns 'info' for domestic employer business and starting business persona", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          industryId: "domestic-employer",
          legalStructureId: undefined,
          businessPersona: "STARTING",
          operatingPhase: OperatingPhaseId.FORMED,
          homeBasedBusiness: false,
        }),
      });
      expect(getPersonalizeTaskButtonTabValue(business)).toBe("info");
    });

    it("returns 'info' for remote worker business", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          homeBasedBusiness: true,
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: ["employeesInNJ"],
        }),
      });
      expect(getPersonalizeTaskButtonTabValue(business)).toBe("info");
    });

    it("returns 'info' for remote seller business", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          homeBasedBusiness: true,
          businessPersona: "FOREIGN",
          foreignBusinessTypeIds: ["revenueInNJ"],
        }),
      });
      expect(getPersonalizeTaskButtonTabValue(business)).toBe("info");
    });

    it("returns 'personalize' for starting business with their business structure complete", () => {
      const business = generateBusiness({
        taskProgress: { "business-structure": "COMPLETED" },
        profileData: generateProfileData({
          businessPersona: "STARTING",
          legalStructureId: "limited-liability-company",
        }),
      });
      expect(getPersonalizeTaskButtonTabValue(business)).toBe("personalize");
    });

    it("returns 'personalize' for nexus business with their business structure complete", () => {
      const business = generateBusiness({
        taskProgress: { "business-structure": "COMPLETED" },
        profileData: generateProfileData({
          businessPersona: "FOREIGN",
          nexusDbaName: "Some Name",
          legalStructureId: "corporation",
          foreignBusinessTypeIds: ["officeInNJ"],
        }),
      });
      expect(getPersonalizeTaskButtonTabValue(business)).toBe("personalize");
    });

    it("returns 'personalize' if operating phase is UP_AND_RUNNING", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          businessPersona: "OWNING",
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
        }),
      });
      expect(getPersonalizeTaskButtonTabValue(business)).toBe("personalize");
    });

    it("returns 'personalize' if operating phase is UP_AND_RUNNING_OWNING", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          businessPersona: "OWNING",
          operatingPhase: OperatingPhaseId.UP_AND_RUNNING_OWNING,
        }),
      });
      expect(getPersonalizeTaskButtonTabValue(business)).toBe("personalize");
    });

    it("returns 'permits' for business not matching any condition", () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          businessPersona: "OWNING",
          legalStructureId: undefined,
          operatingPhase: OperatingPhaseId.GUEST_MODE,
        }),
      });
      expect(getPersonalizeTaskButtonTabValue(business)).toBe("permits");
    });
  });
});
