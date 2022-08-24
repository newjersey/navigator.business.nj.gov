import { randomElementFromArray } from "../../../test/helpers";
import {
  generatev81FormationFormData,
  generatev81ProfileData,
  generatev81User,
  v81OperatingPhase,
  v81ProfileData,
  v81UserData,
} from "./v81_add_completed_filing_payment";
import { migrate_v81_to_v82 } from "./v82_add_up_and_running_owning_operating_phase";

describe("migrate_v81_to_v82", () => {
  it("updates operating phase when operating phase is up_and_running and businessPersona is owning", () => {
    const v81 = makeUserData({ businessPersona: "OWNING", operatingPhase: "UP_AND_RUNNING" });
    const v82 = migrate_v81_to_v82(v81);
    expect(v82.profileData.operatingPhase).toEqual("UP_AND_RUNNING_OWNING");
  });

  it("does not update operating phase when operating phase is up_and_running and businessPersona is starting", () => {
    const v81 = makeUserData({ businessPersona: "STARTING", operatingPhase: "UP_AND_RUNNING" });
    const v82 = migrate_v81_to_v82(v81);
    expect(v82.profileData.operatingPhase).toEqual("UP_AND_RUNNING");
  });

  it("does not update operating phase when operating phase is not up_and_running and businessPersona is owning", () => {
    const operatingPhaseIdsExcludingUpAndRunning = [
      "GUEST_MODE",
      "GUEST_MODE_OWNING",
      "NEEDS_TO_FORM",
      "NEEDS_TO_REGISTER_FOR_TAXES",
      "FORMED_AND_REGISTERED",
    ];

    const randomOperatingPhase = randomElementFromArray(operatingPhaseIdsExcludingUpAndRunning);

    const v81 = makeUserData({
      businessPersona: "OWNING",
      operatingPhase: randomOperatingPhase as v81OperatingPhase,
    });
    const v82 = migrate_v81_to_v82(v81);
    expect(v82.profileData.operatingPhase).toEqual(randomOperatingPhase);
  });
});

const makeUserData = (profileData: Partial<v81ProfileData>): v81UserData => {
  return {
    user: generatev81User({}),
    profileData: generatev81ProfileData({ ...profileData }),
    formProgress: "COMPLETED",
    taskProgress: {},
    taskItemChecklist: {},
    licenseData: undefined,
    preferences: {
      roadmapOpenSections: ["PLAN", "START"],
      roadmapOpenSteps: [],
      hiddenCertificationIds: [],
      hiddenFundingIds: [],
      visibleSidebarCards: ["welcome"],
      returnToLink: "",
      isCalendarFullView: true,
    },
    taxFilingData: {
      filings: [],
    },
    formationData: {
      formationFormData: generatev81FormationFormData({}),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
    },
    version: 81,
  };
};
