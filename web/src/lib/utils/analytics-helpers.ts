/* eslint-disable no-prototype-builtins */
import { getEssentialQuestion } from "@/lib/domain-logic/essentialQuestions";
import analytics, { DimensionQueueFactory, Questions } from "@/lib/utils/analytics";
import { camelCaseToSnakeCase } from "@/lib/utils/cases-helpers";
import {
  ABExperience,
  BusinessPersona,
  ForeignBusinessType,
  IndustrySpecificData,
  LookupOperatingPhaseById,
  OperatingPhaseId,
  ProfileData,
  UserData,
  determineForeignBusinessType,
  getCurrentBusiness,
} from "@businessnjgovnavigator/shared";
import { GUEST_MODE } from "@businessnjgovnavigator/shared/";

type RegistrationProgress = "Not Started" | "Began Onboarding" | "Onboarded Guest" | "Fully Registered";

export const setOnLoadDimensions = (userData: UserData): void => {
  setAnalyticsDimensions(getCurrentBusiness(userData).profileData, true);
  setUserId(userData.user.id, true);
  setABExperienceDimension(userData.user.abExperience);
};

export const setRegistrationDimension = (
  status: RegistrationProgress,
  queue = false
): DimensionQueueFactory => {
  const updateQueue = analytics.dimensions.registrationStatus(status);
  !queue && updateQueue.update();
  return updateQueue;
};

export const setABExperienceDimension = (value: ABExperience, queue = false): DimensionQueueFactory => {
  const updateQueue = analytics.dimensions.abExperience(value);
  !queue && updateQueue.update();
  return updateQueue;
};

export const setPhaseDimension = (value: OperatingPhaseId, queue = false): DimensionQueueFactory => {
  const phase = LookupOperatingPhaseById(value);
  const updateQueue = analytics.dimensions.phase(getPhaseDimension(value), phase.displayCalendarType);
  !queue && updateQueue.update();
  return updateQueue;
};

export const setUserId = (user_id: string, queue = false): DimensionQueueFactory => {
  const updateQueue = analytics.dimensions.userId(user_id);
  !queue && updateQueue.update();
  return updateQueue;
};

export const phaseChangeAnalytics = ({
  oldUserData,
  newUserData,
}: {
  oldUserData: UserData;
  newUserData: UserData;
}): void => {
  const oldProfileData = getCurrentBusiness(oldUserData).profileData;
  const newProfileData = getCurrentBusiness(newUserData).profileData;
  if (oldProfileData.operatingPhase === newProfileData.operatingPhase) {
    return;
  } else if (
    (oldProfileData.operatingPhase === "NEEDS_TO_FORM" ||
      oldProfileData.operatingPhase === "NEEDS_BUSINESS_STRUCTURE") &&
    newProfileData.operatingPhase === "FORMED"
  ) {
    analytics.event.roadmap_dashboard.arrive.progress_to_formed_phase();
  } else if (
    oldProfileData.operatingPhase === "FORMED" &&
    newProfileData.operatingPhase === "UP_AND_RUNNING"
  ) {
    analytics.event.roadmap_dashboard.arrive.progress_to_up_and_running_phase();
  }
};

export const setAnalyticsDimensions = (profileData: ProfileData, queue = false): void => {
  analytics.dimensions.industry(profileData.industryId);
  analytics.dimensions.municipality(profileData.municipality?.displayName);
  analytics.dimensions.legalStructure(profileData.legalStructureId);
  analytics.dimensions.homeBasedBusiness(profileData.homeBasedBusiness);
  analytics.dimensions.persona(getPersonaDimension(profileData.businessPersona));
  analytics.dimensions.naicsCode(profileData.naicsCode);
  setPhaseDimension(profileData.operatingPhase, true);
  analytics.dimensions.subPersona(
    getSubPersonaDimension(determineForeignBusinessType(profileData.foreignBusinessTypeIds))
  );
  !queue && analytics.dimensions.update();
};

const getPhaseDimension = (phase: OperatingPhaseId): string => {
  switch (phase) {
    case GUEST_MODE:
      return "Guest Mode Needs to Form";
    case "GUEST_MODE_OWNING":
      return "Guest Mode Up and Running";
    case "NEEDS_TO_FORM":
      return "Needs to Form";
    case "FORMED":
      return "Formed";
    case "UP_AND_RUNNING":
      return "Up and Running";
    case "UP_AND_RUNNING_OWNING":
      return "Up and Running";
    default:
      return phase;
  }
};

const getPersonaDimension = (persona: BusinessPersona): string => {
  switch (persona) {
    case "STARTING":
      return "Prospective";
    case "OWNING":
      return "Existing";
    case "FOREIGN":
      return "Foreign Prospective";
    default:
      return "";
  }
};

const getSubPersonaDimension = (type: ForeignBusinessType): string => {
  switch (type) {
    case "REMOTE_WORKER":
      return "Remote Worker";
    case "REMOTE_SELLER":
      return "Remote Seller";
    case "NEXUS":
      return "Nexus Business";
    case "NONE":
      return "None of the Above";
    default:
      return "";
  }
};
const sendEssentialQuestionEvents = (newProfileData: ProfileData): void => {
  const questions = getEssentialQuestion(newProfileData.industryId);
  const questionResponseMap: Partial<Record<keyof IndustrySpecificData, keyof Questions>> = {
    cannabisLicenseType: "cannabis_license_type",
    liquorLicense: "require_liquor_license",
    carService: "car_service_size",
    providesStaffingService: "staffing_services",
    interstateMoving: "moving_across_state_lines",
    certifiedInteriorDesigner: "certified_interior_designer",
    interstateLogistics: "interstate_logistics",
    isChildcareForSixOrMore: "childcare_for_six_or_more",
    requiresCpa: "offer_public_accounting",
    realEstateAppraisalManagement: "real_estate_appraisal",
    petCareHousing: "pet_care_housing",
    willSellPetCareItems: "pet_care_sell_items",
  };

  let eventQuestions: Partial<Questions> = {};

  questions.map((question) => {
    let questionName = questionResponseMap[question.fieldName];
    if (newProfileData[question.fieldName] === undefined) {
      return;
    }
    if (questionName === undefined) {
      questionName = camelCaseToSnakeCase(question.fieldName);
    }
    if (typeof newProfileData[question.fieldName] === "boolean") {
      eventQuestions = {
        ...eventQuestions,
        [questionName]: newProfileData[question.fieldName] ? "yes" : "no",
      };
    } else if (question.fieldName === "cannabisLicenseType") {
      eventQuestions = {
        ...eventQuestions,
        [questionName]: newProfileData[question.fieldName] === "CONDITIONAL" ? "conditional" : "annual",
      };
    } else if (question.fieldName === "carService") {
      eventQuestions = {
        ...eventQuestions,
        [questionName]:
          newProfileData[question.fieldName] === "STANDARD"
            ? "taxi_size"
            : newProfileData[question.fieldName] === "HIGH_CAPACITY"
            ? "large_size"
            : "both_sizes",
      };
    }
  });

  analytics.eventRunner.track({
    event: "form_submits",
    form_name: "industry_essential_questions",
    questions: eventQuestions,
  });
};

export const sendOnboardingOnSubmitEvents = (newProfileData: ProfileData, pageName?: string): void => {
  if (pageName === "industry-page" && newProfileData.industryId) {
    sendEssentialQuestionEvents(newProfileData);
  }
};
