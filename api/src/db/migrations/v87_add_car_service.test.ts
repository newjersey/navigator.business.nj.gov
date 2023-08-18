import {
  generatev86FormationFormData,
  generatev86ProfileData,
  generatev86User,
  v86ProfileData,
  v86UserData
} from "./v86_tax_filing_var_rename";
import { migrate_v86_to_v87 } from "./v87_add_car_service";

describe("migrate_v86_to_v87", () => {
  it("updates the car service type to STANDARD and keeps the industryId as car-service as it was car-service before", () => {
    const v86 = makeUserData({ industryId: "car-service" });
    const v87 = migrate_v86_to_v87(v86);
    expect(v87.profileData.industryId).toEqual("car-service");
    expect(v87.profileData.carService).toEqual("STANDARD");
  });

  it("updates the car service type to HIGH_CAPACITY and changes the industryId to car-service if it was transportation before", () => {
    const v86 = makeUserData({ industryId: "transportation" });
    const v87 = migrate_v86_to_v87(v86);
    expect(v87.profileData.industryId).toEqual("car-service");
    expect(v87.profileData.carService).toEqual("HIGH_CAPACITY");
  });

  it("doesn't change the industryId and car service is undefined if current industryId is not transportation or car-service", () => {
    const v86 = makeUserData({ industryId: "generic" });
    const v87 = migrate_v86_to_v87(v86);
    expect(v87.profileData.industryId).toEqual("generic");
    expect(v87.profileData.carService).toEqual(undefined);
  });
});

const makeUserData = (profileData: Partial<v86ProfileData>): v86UserData => {
  return {
    user: generatev86User({}),
    profileData: generatev86ProfileData({ ...profileData }),
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
      isHideableRoadmapOpen: true
    },
    taxFilingData: {
      filings: []
    },
    formationData: {
      formationFormData: generatev86FormationFormData({}),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false
    },
    version: 86
  };
};
