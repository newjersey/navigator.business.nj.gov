import {
  generatev72FormationFormData,
  generatev72ProfileData,
  generatev72User,
  v72ProfileData,
  v72TaskProgress,
  v72UserData,
} from "@db/migrations/v72_add_real_estate_management";
import { migrate_v72_to_v73 } from "@db/migrations/v73_add_operating_status_field";

describe("migrate_v72_to_v73", () => {
  it("sets an owning user to UP_AND_RUNNING status", () => {
    const profileData = generatev72ProfileData({
      businessPersona: "OWNING",
    });
    const taskProgress = {} as Record<string, v72TaskProgress>;
    const v72 = makeUserData(profileData, taskProgress, "mynj-key");
    const v73 = migrate_v72_to_v73(v72);

    expect(v73.profileData.operatingPhase).toEqual("UP_AND_RUNNING");
  });

  it("sets a user with taxes completed to FORMED_AND_REGISTERED status", () => {
    const profileData = generatev72ProfileData({
      businessPersona: "STARTING",
    });
    const taskProgress = {
      "register-for-taxes": "COMPLETED",
    } as Record<string, v72TaskProgress>;
    const v72 = makeUserData(profileData, taskProgress, "mynj-key");
    const v73 = migrate_v72_to_v73(v72);

    expect(v73.profileData.operatingPhase).toEqual("FORMED_AND_REGISTERED");
  });

  it("sets a user with formation completed to NEEDS_TO_REGISTER_FOR_TAXES status", () => {
    const profileData = generatev72ProfileData({
      businessPersona: "STARTING",
    });
    const taskProgress = {
      "form-business-entity": "COMPLETED",
    } as Record<string, v72TaskProgress>;
    const v72 = makeUserData(profileData, taskProgress, "mynj-key");
    const v73 = migrate_v72_to_v73(v72);

    expect(v73.profileData.operatingPhase).toEqual("NEEDS_TO_REGISTER_FOR_TAXES");
  });

  it("sets a Public Record Filing user without formation completed to NEEDS_TO_FORM status", () => {
    const profileData = generatev72ProfileData({
      businessPersona: "STARTING",
      legalStructureId: "limited-liability-company",
    });
    const taskProgress = {
      "form-business-entity": "IN_PROGRESS",
    } as Record<string, v72TaskProgress>;
    const v72 = makeUserData(profileData, taskProgress, "mynj-key");
    const v73 = migrate_v72_to_v73(v72);

    expect(v73.profileData.operatingPhase).toEqual("NEEDS_TO_FORM");
  });

  it("sets a Trade Name user without formation completed to NEEDS_TO_REGISTER_FOR_TAXES status", () => {
    const profileData = generatev72ProfileData({
      businessPersona: "STARTING",
      legalStructureId: "sole-proprietorship",
    });
    const taskProgress = {
      "form-business-entity": "IN_PROGRESS",
    } as Record<string, v72TaskProgress>;
    const v72 = makeUserData(profileData, taskProgress, "mynj-key");
    const v73 = migrate_v72_to_v73(v72);

    expect(v73.profileData.operatingPhase).toEqual("NEEDS_TO_REGISTER_FOR_TAXES");
  });

  it("sets a user without a MyNJ key to GUEST_MODE status", () => {
    const profileData = generatev72ProfileData({
      businessPersona: "STARTING",
    });
    const v72 = makeUserData(profileData, {});
    const v73 = migrate_v72_to_v73(v72);

    expect(v73.profileData.operatingPhase).toEqual("GUEST_MODE");
  });
});

const makeUserData = (
  profileData: v72ProfileData,
  taskProgress: Record<string, v72TaskProgress>,
  myNJUserKey?: string | undefined
): v72UserData => {
  return {
    user: generatev72User({ myNJUserKey }),
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
      formationFormData: generatev72FormationFormData({}),
      formationResponse: undefined,
      getFilingResponse: undefined,
    },
    version: 67,
  };
};
