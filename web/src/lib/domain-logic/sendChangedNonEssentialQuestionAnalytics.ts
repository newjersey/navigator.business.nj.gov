import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";
import analytics from "@/lib/utils/analytics";

const Config = getMergedConfig();

export const sendChangedNonEssentialQuestionAnalytics = (
  prevProfileData: ProfileData,
  newProfileData: ProfileData,
): void => {
  const prevNonEssentialRadioAnswers: Record<string, boolean | undefined> =
    prevProfileData.nonEssentialRadioAnswers;
  const newNonEssentialRadioAnswers: Record<string, boolean | undefined> =
    newProfileData.nonEssentialRadioAnswers;

  for (const key in newNonEssentialRadioAnswers) {
    const prevValue = prevNonEssentialRadioAnswers[key];
    const currValue = newNonEssentialRadioAnswers[key];

    if (didNonEssentialQuestionAnswerChange(prevValue, currValue)) {
      analytics.event.non_essential_question_set.view.non_essential_question_set(
        key,
        getNonEssentialQuestionAnswer(currValue),
      );
    }
  }

  if (
    didNonEssentialQuestionAnswerChange(
      prevProfileData.carnivalRideOwningBusiness,
      newProfileData.carnivalRideOwningBusiness,
    )
  ) {
    analytics.event.non_essential_question_set.view.non_essential_question_set(
      "carnivalRideOwningBusiness",
      getNonEssentialQuestionAnswer(newProfileData.carnivalRideOwningBusiness),
    );
  }

  if (
    didNonEssentialQuestionAnswerChange(
      prevProfileData.raffleBingoGames,
      newProfileData.raffleBingoGames,
    )
  ) {
    analytics.event.non_essential_question_set.view.non_essential_question_set(
      "raffleBingoGames",
      getNonEssentialQuestionAnswer(newProfileData.raffleBingoGames),
    );
  }

  if (
    didNonEssentialQuestionAnswerChange(
      prevProfileData.travelingCircusOrCarnivalOwningBusiness,
      newProfileData.travelingCircusOrCarnivalOwningBusiness,
    )
  ) {
    analytics.event.non_essential_question_set.view.non_essential_question_set(
      "travelingCircusOrCarnivalOwningBusiness",
      getNonEssentialQuestionAnswer(newProfileData.travelingCircusOrCarnivalOwningBusiness),
    );
  }

  if (
    didNonEssentialQuestionAnswerChange(
      prevProfileData.elevatorOwningBusiness,
      newProfileData.elevatorOwningBusiness,
    )
  ) {
    analytics.event.non_essential_question_set.view.non_essential_question_set(
      "elevatorOwningBusiness",
      getNonEssentialQuestionAnswer(newProfileData.elevatorOwningBusiness),
    );
  }

  if (
    didNonEssentialQuestionAnswerChange(
      prevProfileData.homeBasedBusiness,
      newProfileData.homeBasedBusiness,
    )
  ) {
    analytics.event.non_essential_question_set.view.non_essential_question_set(
      "homeBasedBusiness",
      getNonEssentialQuestionAnswer(newProfileData.homeBasedBusiness),
    );
  }

  if (
    didNonEssentialQuestionAnswerChange(
      prevProfileData.plannedRenovationQuestion,
      newProfileData.plannedRenovationQuestion,
    )
  ) {
    analytics.event.non_essential_question_set.view.non_essential_question_set(
      "plannedRenovationQuestion",
      getNonEssentialQuestionAnswer(newProfileData.plannedRenovationQuestion),
    );
  }

  if (
    didNonEssentialQuestionAnswerChange(
      prevProfileData.vacantPropertyOwner,
      newProfileData.vacantPropertyOwner,
    )
  ) {
    analytics.event.non_essential_question_set.view.non_essential_question_set(
      "vacantPropertyOwner",
      getNonEssentialQuestionAnswer(newProfileData.vacantPropertyOwner),
    );
  }
};

const didNonEssentialQuestionAnswerChange = (
  prevAnswer: boolean | undefined,
  newAnswer: boolean | undefined,
): boolean => {
  return (
    (prevAnswer === undefined && newAnswer !== undefined) ||
    (prevAnswer !== undefined && newAnswer !== undefined && prevAnswer !== newAnswer)
  );
};

const getNonEssentialQuestionAnswer = (questionAnswer: boolean | undefined): string => {
  return questionAnswer
    ? Config.profileDefaults.fields.nonEssentialQuestions.default.radioButtonTrueText
    : Config.profileDefaults.fields.nonEssentialQuestions.default.radioButtonFalseText;
};
