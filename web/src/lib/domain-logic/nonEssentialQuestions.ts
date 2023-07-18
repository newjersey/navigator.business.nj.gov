import {
  emptyIndustrySpecificData,
  Industry,
  IndustrySpecificData,
  LookupIndustryById,
} from "@businessnjgovnavigator/shared";

export const getResetIndustrySpecificDataNonEssentialQuestions = (
  industryId: string | undefined
): Partial<IndustrySpecificData> => {
  const industry = LookupIndustryById(industryId);
  return NonEssentialQuestions.filter((eQ) => {
    return eQ.shouldBeResetWhenIndustryChanges && !eQ.isQuestionApplicableToIndustry(industry);
  }).reduce((reducer, eQ) => {
    return { ...reducer, [eQ.fieldName]: emptyIndustrySpecificData[eQ.fieldName] };
  }, {} as Partial<IndustrySpecificData>);
};

export interface NonEssentialQuestionObject {
  fieldName: keyof IndustrySpecificData;
  isQuestionApplicableToIndustry: (industry: Industry) => boolean;
  shouldBeResetWhenIndustryChanges: boolean;
}
export class NonEssentialQuestion implements NonEssentialQuestionObject {
  fieldName!: keyof IndustrySpecificData;
  isQuestionApplicableToIndustry!: (industry: Industry) => boolean;
  shouldBeResetWhenIndustryChanges!: boolean;

  constructor(eQ: NonEssentialQuestionObject) {
    Object.assign(this, eQ);
  }

  isQuestionApplicableToIndustryId(industryId: string | undefined): boolean {
    return this.isQuestionApplicableToIndustry(LookupIndustryById(industryId));
  }
}

export const NonEssentialQuestions: NonEssentialQuestion[] = [
  new NonEssentialQuestion({
    shouldBeResetWhenIndustryChanges: true,
    isQuestionApplicableToIndustry: (industry): boolean => {
      return !!industry.industryOnboardingQuestions.retailWillPierceEars;
    },
    fieldName: "retailWillPierceEars",
  }),
  new NonEssentialQuestion({
    shouldBeResetWhenIndustryChanges: true,
    isQuestionApplicableToIndustry: (industry): boolean => {
      return !!industry.industryOnboardingQuestions.retailWillSellMilk;
    },
    fieldName: "retailWillSellMilk",
  }),
];
