import { getEssentialQuestion, hasEssentialQuestion } from "@/lib/domain-logic/essentialQuestions";
import { modifyContent } from "@/lib/domain-logic/modifyContent";
import { Industry } from "@businessnjgovnavigator/shared/industry";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";

export const insertRoadmapSteps = (content: string, roadMapsStepsLength: number): string => {
  return modifyContent({
    content,
    condition: () => true,
    modificationMap: {
      numberRoadMapEasySteps: `${roadMapsStepsLength} Easy Step${roadMapsStepsLength > 1 ? "s" : ""}`,
    },
  });
};

export const insertIndustryContent = (content: string, industryId: string, industryName: string): string => {
  return modifyContent({
    content,
    condition: () => industryId !== "generic",
    modificationMap: {
      industry: industryName,
    },
  });
};

export const createStarterKitProfileData = (industry: Industry): ProfileData => {
  const emptyProfileData = createEmptyProfileData();
  let newProfileData: ProfileData = {
    ...emptyProfileData,
    businessPersona: "STARTING",
    industryId: industry.id,
    legalStructureId: "limited-liability-company",
  };

  if (hasEssentialQuestion(industry.id)) {
    const essentialQuestions = getEssentialQuestion(industry.id);
    for (const essentialQuestion of essentialQuestions) {
      if (typeof newProfileData[essentialQuestion.fieldName] === "boolean") {
        newProfileData = {
          ...newProfileData,
          [essentialQuestion.fieldName]: true,
        };
      }
      if (essentialQuestion.fieldName === "petCareHousing") {
        newProfileData = {
          ...newProfileData,
          [essentialQuestion.fieldName]: true,
        };
      }
      if (essentialQuestion.fieldName === "willSellPetCareItems") {
        newProfileData = {
          ...newProfileData,
          [essentialQuestion.fieldName]: true,
        };
      }
      if (essentialQuestion.fieldName === "isChildcareForSixOrMore") {
        newProfileData = {
          ...newProfileData,
          [essentialQuestion.fieldName]: true,
        };
      }

      if (essentialQuestion.fieldName === "cannabisLicenseType") {
        newProfileData = {
          ...newProfileData,
          [essentialQuestion.fieldName]: "ANNUAL",
        };
      }
      if (essentialQuestion.fieldName === "carService") {
        newProfileData = {
          ...newProfileData,
          [essentialQuestion.fieldName]: "BOTH",
        };
      }
      if (essentialQuestion.fieldName === "constructionType") {
        newProfileData = {
          ...newProfileData,
          [essentialQuestion.fieldName]: "BOTH",
        };
      }
      if (essentialQuestion.fieldName === "residentialConstructionType") {
        newProfileData = {
          ...newProfileData,
          [essentialQuestion.fieldName]: "BOTH",
        };
      }
      if (essentialQuestion.fieldName === "employmentPersonnelServiceType") {
        newProfileData = {
          ...newProfileData,
          [essentialQuestion.fieldName]: "JOB_SEEKERS",
        };
      }
      if (essentialQuestion.fieldName === "employmentPlacementType") {
        newProfileData = {
          ...newProfileData,
          [essentialQuestion.fieldName]: "BOTH",
        };
      }
    }
  }
  return newProfileData;
};
