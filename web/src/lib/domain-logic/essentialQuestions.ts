import { ProfileContentField } from "@/lib/types/types";
import {
  emptyIndustrySpecificData,
  Industry,
  IndustrySpecificData,
  LookupIndustryById,
} from "@businessnjgovnavigator/shared";

export const getResetIndustrySpecificData = (
  industryId: string | undefined
): Partial<IndustrySpecificData> => {
  const industry = LookupIndustryById(industryId);
  return EssentialQuestions.filter((eQ) => {
    return eQ.shouldBeResetWhenIndustryChanges && !eQ.isQuestionApplicableToIndustry(industry);
  }).reduce((reducer, eQ) => {
    return { ...reducer, [eQ.fieldName]: emptyIndustrySpecificData[eQ.fieldName] };
  }, {} as Partial<IndustrySpecificData>);
};

export const getIsApplicableToFunctionByFieldName = (
  fieldName: ProfileContentField
): ((industryId: string | undefined) => boolean) => {
  return (industryId: string | undefined): boolean => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return EssentialQuestions.find((eQ) => {
      return eQ.fieldName == fieldName || eQ.contentFieldName == fieldName;
    })!.isQuestionApplicableToIndustry(LookupIndustryById(industryId));
  };
};
export const hasEssentialQuestion = (industryId: string | undefined): boolean => {
  const industry = LookupIndustryById(industryId);
  const essentialQuestionResults = EssentialQuestions.filter((essentialQuestionFunction) => {
    return essentialQuestionFunction.isQuestionApplicableToIndustry(industry);
  });
  return essentialQuestionResults.length > 0;
};

export const getEssentialQuestion = (industryId: string | undefined) => {
  const industry = LookupIndustryById(industryId);
  return EssentialQuestions.filter((essentialQuestionFunction) => {
    return essentialQuestionFunction.isQuestionApplicableToIndustry(industry);
  });
};

export interface EssentialQuestionObject {
  fieldName: keyof IndustrySpecificData;
  contentFieldName?: ProfileContentField;
  ariaLabel?: string;
  labels?: Record<string, string>;
  isQuestionApplicableToIndustry: (industry: Industry) => boolean;
  shouldBeResetWhenIndustryChanges: boolean;
}
class EssentialQuestion implements EssentialQuestionObject {
  fieldName!: keyof IndustrySpecificData;
  contentFieldName?: ProfileContentField;
  ariaLabel?: string;
  labels?: Record<string, string>;
  isQuestionApplicableToIndustry!: (industry: Industry) => boolean;
  shouldBeResetWhenIndustryChanges!: boolean;

  constructor(eQ: EssentialQuestionObject) {
    Object.assign(this, eQ);
  }

  isQuestionApplicableToIndustryId(industryId: string | undefined) {
    return this.isQuestionApplicableToIndustry(LookupIndustryById(industryId));
  }
}

export const EssentialQuestions: EssentialQuestion[] = [
  new EssentialQuestion({
    shouldBeResetWhenIndustryChanges: true,
    isQuestionApplicableToIndustry: (industry) => {
      return (
        !!industry.industryOnboardingQuestions.isInterstateTransportApplicable && industry.id === "logistics"
      );
    },
    fieldName: "interstateTransport",
    contentFieldName: "interstateLogistics",
  }),

  new EssentialQuestion({
    shouldBeResetWhenIndustryChanges: true,
    isQuestionApplicableToIndustry: (industry) => {
      return (
        !!industry.industryOnboardingQuestions.isInterstateTransportApplicable &&
        industry.id === "moving-company"
      );
    },
    fieldName: "interstateTransport",
    contentFieldName: "interstateMoving",
    ariaLabel: "Moves Goods Across State Lines",
  }),
  new EssentialQuestion({
    shouldBeResetWhenIndustryChanges: true,
    isQuestionApplicableToIndustry: (industry) => {
      return !!industry.industryOnboardingQuestions.isCarServiceApplicable;
    },
    fieldName: "carService",
  }),
  new EssentialQuestion({
    shouldBeResetWhenIndustryChanges: true,
    isQuestionApplicableToIndustry: (industry) => {
      return !!industry.industryOnboardingQuestions.isCertifiedInteriorDesignerApplicable;
    },
    fieldName: "certifiedInteriorDesigner",
  }),
  new EssentialQuestion({
    shouldBeResetWhenIndustryChanges: true,
    isQuestionApplicableToIndustry: (industry) => {
      return !!industry.industryOnboardingQuestions.isChildcareForSixOrMore;
    },
    fieldName: "isChildcareForSixOrMore",
  }),
  new EssentialQuestion({
    shouldBeResetWhenIndustryChanges: true,
    isQuestionApplicableToIndustry: (industry) => {
      return !!industry.industryOnboardingQuestions.isPetCareHousingApplicable;
    },
    fieldName: "petCareHousing",
    contentFieldName: "petCareHousing",
  }),
  new EssentialQuestion({
    shouldBeResetWhenIndustryChanges: true,
    isQuestionApplicableToIndustry: (industry) => {
      return !!industry.industryOnboardingQuestions.willSellPetCareItems;
    },
    fieldName: "willSellPetCareItems",
  }),
  new EssentialQuestion({
    shouldBeResetWhenIndustryChanges: true,
    isQuestionApplicableToIndustry: (industry) => {
      return !!industry.industryOnboardingQuestions.isCpaRequiredApplicable;
    },
    fieldName: "requiresCpa",
  }),
  new EssentialQuestion({
    shouldBeResetWhenIndustryChanges: false,
    isQuestionApplicableToIndustry: (industry) => {
      return !!industry.industryOnboardingQuestions.isCannabisLicenseTypeApplicable;
    },
    fieldName: "cannabisLicenseType",
  }),
  new EssentialQuestion({
    shouldBeResetWhenIndustryChanges: true,
    isQuestionApplicableToIndustry: (industry) => {
      return !!industry.industryOnboardingQuestions.isLiquorLicenseApplicable;
    },
    fieldName: "liquorLicense",
  }),
  new EssentialQuestion({
    shouldBeResetWhenIndustryChanges: true,
    isQuestionApplicableToIndustry: (industry) => {
      return !!industry.industryOnboardingQuestions.isProvidesStaffingServicesApplicable;
    },
    fieldName: "providesStaffingService",
  }),
  new EssentialQuestion({
    shouldBeResetWhenIndustryChanges: true,
    isQuestionApplicableToIndustry: (industry) => {
      return !!industry.industryOnboardingQuestions.isRealEstateAppraisalManagementApplicable;
    },
    fieldName: "realEstateAppraisalManagement",
  }),
];
