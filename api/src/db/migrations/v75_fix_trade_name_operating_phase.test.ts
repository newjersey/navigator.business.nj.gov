import {
  generatev74FormationFormData,
  generatev74ProfileData,
  generatev74User,
  v74ProfileData,
  v74TaskProgress,
  v74UserData,
} from "./v74_change_register_for_taxes_foreign_id";
import { migrate_v74_to_v75 } from "./v75_fix_trade_name_operating_phase";

describe("migrate_v74_to_v75", () => {
  it("sets operatingPhase to NEEDS_TO_REGISTER_FOR_TAXES when NEEDS_TO_FORM and has a trade name", () => {
    const profileData = generatev74ProfileData({
      businessPersona: "STARTING",
      operatingPhase: "NEEDS_TO_FORM",
      legalStructureId: "general-partnership",
    });
    const taskProgress = {} as Record<string, v74TaskProgress>;
    const v74 = makeUserData(profileData, taskProgress);
    const v75 = migrate_v74_to_v75(v74);

    expect(v75.profileData.operatingPhase).toEqual("NEEDS_TO_REGISTER_FOR_TAXES");
  });

  it("keeps operatingPhase at NEEDS_TO_FORM when legal structure does not have a trade name", () => {
    const profileData = generatev74ProfileData({
      businessPersona: "STARTING",
      operatingPhase: "NEEDS_TO_FORM",
      legalStructureId: "limited-liability-company",
    });
    const taskProgress = {} as Record<string, v74TaskProgress>;
    const v74 = makeUserData(profileData, taskProgress);
    const v75 = migrate_v74_to_v75(v74);

    expect(v75.profileData.operatingPhase).toEqual("NEEDS_TO_FORM");
  });
});

const makeUserData = (
  profileData: v74ProfileData,
  taskProgress: Record<string, v74TaskProgress>,
): v74UserData => {
  return {
    user: generatev74User({}),
    profileData,
    formProgress: "COMPLETED",
    taskProgress: taskProgress,
    taskItemChecklist: {},
    licenseData: undefined,
    preferences: {
      roadmapOpenSections: ["PLAN", "START"],
      roadmapOpenSteps: [],
      hiddenCertificationIds: [],
      hiddenFundingIds: [],
      visibleRoadmapSidebarCards: [],
    },
    taxFilingData: {
      filings: [],
    },
    formationData: {
      formationFormData: generatev74FormationFormData({}),
      formationResponse: undefined,
      getFilingResponse: undefined,
    },
    version: 74,
  };
};
