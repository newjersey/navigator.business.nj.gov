import {
  generatev75FormationFormData,
  generatev75ProfileData,
  generatev75User,
  v75ProfileData,
  v75TaskProgress,
  v75UserData,
} from "./v75_fix_trade_name_operating_phase";
import { migrate_v75_to_v76 } from "./v76_fix_trade_name_operating_phase_round_2";

describe("migrate_v75_to_v76", () => {
  it("sets operatingPhase to NEEDS_TO_REGISTER_FOR_TAXES when NEEDS_TO_FORM and has a trade name", () => {
    const profileData = generatev75ProfileData({
      businessPersona: "STARTING",
      operatingPhase: "NEEDS_TO_FORM",
      legalStructureId: "general-partnership",
    });
    const taskProgress = {} as Record<string, v75TaskProgress>;
    const v75 = makeUserData(profileData, taskProgress);
    const v76 = migrate_v75_to_v76(v75);

    expect(v76.profileData.operatingPhase).toEqual("NEEDS_TO_REGISTER_FOR_TAXES");
  });

  it("keeps operatingPhase at NEEDS_TO_FORM when legal structure does not have a trade name", () => {
    const profileData = generatev75ProfileData({
      businessPersona: "STARTING",
      operatingPhase: "NEEDS_TO_FORM",
      legalStructureId: "limited-liability-company",
    });
    const taskProgress = {} as Record<string, v75TaskProgress>;
    const v75 = makeUserData(profileData, taskProgress);
    const v76 = migrate_v75_to_v76(v75);

    expect(v76.profileData.operatingPhase).toEqual("NEEDS_TO_FORM");
  });
});

const makeUserData = (
  profileData: v75ProfileData,
  taskProgress: Record<string, v75TaskProgress>
): v75UserData => {
  return {
    user: generatev75User({}),
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
      formationFormData: generatev75FormationFormData({}),
      formationResponse: undefined,
      getFilingResponse: undefined,
    },
    version: 75,
  };
};
