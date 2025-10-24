import { mediaAreaToNotApplicableOption } from "@/components/tasks/environment-questionnaire/helpers";
import { removeContextualInfoFormatting } from "@/lib/utils/content-helpers";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts/configContext";
import {
  MediaArea,
  Questionnaire,
  QuestionnaireConfig,
  QuestionnaireData,
  QuestionnaireFieldIds,
} from "@businessnjgovnavigator/shared/environment";

export const optionsMarkedTrueForMediaArea = (
  questionnaire: Questionnaire,
  mediaArea: MediaArea,
): string[] => {
  if (!questionnaire) return [];
  const Config = getMergedConfig();
  const optionsMarkedTrue: string[] = [];
  const questionnaireConfig = Config.envQuestionPage[mediaArea]
    .questionnaireOptions as QuestionnaireConfig;

  for (const [optionId, selected] of Object.entries(questionnaire)) {
    const text = questionnaireConfig[optionId as QuestionnaireFieldIds];
    selected === true && optionsMarkedTrue.push(text);
  }

  return optionsMarkedTrue;
};

const isMediaAreaApplicable = (
  questionnaireData: QuestionnaireData,
  mediaArea: MediaArea,
): boolean => {
  const mediaAreaData = questionnaireData[mediaArea] as Questionnaire;
  const notApplicableOption = mediaAreaToNotApplicableOption[mediaArea];
  return mediaAreaData[notApplicableOption] !== true;
};

export const responsesToString = (questionnaireData: QuestionnaireData): string => {
  const Config = getMergedConfig();
  let result = "";
  for (const mediaArea of Object.keys(questionnaireData) as MediaArea[]) {
    if (isMediaAreaApplicable(questionnaireData, mediaArea)) {
      const questionnaire = questionnaireData[mediaArea] as Questionnaire;
      const optionsMarkedTrue = optionsMarkedTrueForMediaArea(questionnaire, mediaArea);
      if (optionsMarkedTrue.length > 0) {
        const optionsList = optionsMarkedTrue
          .map((option) => {
            return `<li>${removeContextualInfoFormatting(option)}</li>`;
          })
          .join("");
        // eslint-disable-next-line unicorn/prefer-spread
        result = result.concat(
          `<li>${Config.envResultsPage.contactDep[mediaArea].heading}</li><ul>${optionsList}</ul>`,
        );
      }
    }
  }
  return `<ul>${result}</ul>`;
};
