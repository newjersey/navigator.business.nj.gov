import { getIsApplicableToFunctionByFieldName } from "@/lib/domain-logic/essentialQuestions";
import analytics from "@/lib/utils/analytics";
import { ABExperience, ProfileData } from "@businessnjgovnavigator/shared/";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/operatingPhase";
import { BusinessPersona, ForeignBusinessType } from "@businessnjgovnavigator/shared/profileData";
import { UserData } from "@businessnjgovnavigator/shared/userData";

type RegistrationProgress = "Not Started" | "Began Onboarding" | "Onboarded Guest" | "Fully Registered";

export const setRegistrationDimension = (status: RegistrationProgress) => {
  analytics.dimensions.registrationStatus(status);
};

export const setABExperienceDimension = (value: ABExperience) => {
  analytics.dimensions.abExperience(value);
};

export const setPhaseDimension = (value: OperatingPhaseId) => {
  analytics.dimensions.phase(getPhaseDimension(value));
};

export const phaseChangeAnalytics = ({
  oldUserData,
  newUserData,
}: {
  oldUserData: UserData;
  newUserData: UserData;
}) => {
  if (oldUserData.profileData.operatingPhase === newUserData.profileData.operatingPhase) {
    return;
  } else if (
    oldUserData.profileData.operatingPhase === "NEEDS_TO_FORM" &&
    newUserData.profileData.operatingPhase === "NEEDS_TO_REGISTER_FOR_TAXES"
  ) {
    analytics.event.roadmap_dashboard.arrive.progress_to_needs_to_register_phase();
  } else if (
    oldUserData.profileData.operatingPhase === "NEEDS_TO_REGISTER_FOR_TAXES" &&
    newUserData.profileData.operatingPhase === "FORMED_AND_REGISTERED"
  ) {
    analytics.event.roadmap_dashboard.arrive.progress_to_formed_and_registered_phase();
  } else if (
    oldUserData.profileData.operatingPhase === "FORMED_AND_REGISTERED" &&
    newUserData.profileData.operatingPhase === "UP_AND_RUNNING"
  ) {
    analytics.event.roadmap_dashboard.arrive.progress_to_up_and_running_phase();
  }
};

export const setAnalyticsDimensions = (profileData: ProfileData): void => {
  analytics.dimensions.industry(profileData.industryId);
  analytics.dimensions.municipality(profileData.municipality?.displayName);
  analytics.dimensions.legalStructure(profileData.legalStructureId);
  analytics.dimensions.homeBasedBusiness(profileData.homeBasedBusiness ? "true" : "false");
  analytics.dimensions.persona(getPersonaDimension(profileData.businessPersona));
  analytics.dimensions.naicsCode(profileData.naicsCode);
  analytics.dimensions.phase(getPhaseDimension(profileData.operatingPhase));
  analytics.dimensions.subPersona(getSubPersonaDimension(profileData.foreignBusinessType));
};

const getPhaseDimension = (phase: OperatingPhaseId) => {
  switch (phase) {
    case "GUEST_MODE":
      return "Guest Mode Needs to Form";
    case "GUEST_MODE_OWNING":
      return "Guest Mode Up and Running";
    case "NEEDS_TO_FORM":
      return "Needs to Form";
    case "NEEDS_TO_REGISTER_FOR_TAXES":
      return "Needs to Register";
    case "FORMED_AND_REGISTERED":
      return "Formed and Registered";
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

export const sendOnboardingOnSubmitEvents = (newProfileData: ProfileData, pageName?: string): void => {
  if (pageName === "industry-page") {
    if (getIsApplicableToFunctionByFieldName("cannabisLicenseType")(newProfileData.industryId)) {
      if (newProfileData.cannabisLicenseType === "CONDITIONAL") {
        analytics.event.onboarding_cannabis_question.submit.conditional_cannabis_license();
      } else if (newProfileData.cannabisLicenseType === "ANNUAL") {
        analytics.event.onboarding_cannabis_question.submit.annual_cannabis_license();
      }
    }

    if (getIsApplicableToFunctionByFieldName("requiresCpa")(newProfileData.industryId)) {
      if (newProfileData.requiresCpa) {
        analytics.event.onboarding_cpa_question.submit.yes_i_offer_public_accounting();
      } else {
        analytics.event.onboarding_cpa_question.submit.no_i_dont_offer_public_accounting();
      }
    }

    if (getIsApplicableToFunctionByFieldName("interstateMoving")(newProfileData.industryId)) {
      if (newProfileData.interstateMoving) {
        analytics.event.onboarding_moving_company_question.submit.yes_moving_across_state_lines();
      } else {
        analytics.event.onboarding_moving_company_question.submit.no_moving_across_state_lines();
      }
    }

    if (getIsApplicableToFunctionByFieldName("interstateLogistics")(newProfileData.industryId)) {
      if (newProfileData.interstateLogistics) {
        analytics.event.onboarding_logistics_business_question.submit.yes_moving_across_state_lines();
      } else {
        analytics.event.onboarding_logistics_business_question.submit.no_not_moving_across_state_lines();
      }
    }

    if (getIsApplicableToFunctionByFieldName("carService")(newProfileData.industryId)) {
      switch (newProfileData.carService) {
        case "STANDARD": {
          analytics.event.onboarding_car_service_question.submit.taxi_size();
          break;
        }
        case "HIGH_CAPACITY": {
          analytics.event.onboarding_car_service_question.submit.large_size();
          break;
        }
        case "BOTH": {
          analytics.event.onboarding_car_service_question.submit.both_sizes();
          break;
        }
      }
    }

    if (getIsApplicableToFunctionByFieldName("isChildcareForSixOrMore")(newProfileData.industryId)) {
      if (newProfileData.isChildcareForSixOrMore) {
        analytics.event.onboarding_childcare_business_question.submit.yes_more_than_6_children();
      } else {
        analytics.event.onboarding_childcare_business_question.submit.no_5_or_fewer_children();
      }
    }

    if (getIsApplicableToFunctionByFieldName("liquorLicense")(newProfileData.industryId)) {
      if (newProfileData.liquorLicense) {
        analytics.event.onboarding_liquor_question.submit.yes_require_liquor_license();
      } else {
        analytics.event.onboarding_liquor_question.submit.no_dont_require_liquor_license();
      }
    }
  }
};
