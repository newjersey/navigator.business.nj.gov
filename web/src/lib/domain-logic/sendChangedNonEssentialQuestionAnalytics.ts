import { getMergedConfig } from "@/contexts/configContext";
import { getNonEssentialQuestionText } from "@/lib/domain-logic/getNonEssentialQuestionText";
import analytics from "@/lib/utils/analytics";

export const sendChangedNonEssentialQuestionAnalytics = (
  prevNonEssentialRadioAnswers: Record<string, boolean | undefined>,
  newNonEssentialRadioAnswers: Record<string, boolean | undefined>
): void => {
  const Config = getMergedConfig();
  for (const key in newNonEssentialRadioAnswers) {
    const prevValue = prevNonEssentialRadioAnswers[key];
    const currValue = newNonEssentialRadioAnswers[key];

    if (
      (prevValue === undefined && currValue !== undefined) ||
      (prevValue !== undefined && currValue !== undefined && prevValue !== currValue)
    ) {
      const questionText = getNonEssentialQuestionText(key);
      const questionAnswer = currValue
        ? Config.profileDefaults.fields.nonEssentialQuestions.default.radioButtonTrueText
        : Config.profileDefaults.fields.nonEssentialQuestions.default.radioButtonFalseText;
      if (questionText) {
        // analytics.event.non_essential_question.submitted.submit_non_essential_question(
        //   questionText,
        //   questionAnswer
        // );
      }
    }
  }
};
