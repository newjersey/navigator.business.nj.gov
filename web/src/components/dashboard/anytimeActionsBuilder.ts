import { getNonEssentialQuestionAnytimeActions } from "@/lib/domain-logic/getNonEssentialQuestionAnytimeActions";
import { AnytimeActionTask } from "@/lib/types/types";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";

export const getAnytimeActionsFromNonEssentialQuestions = (
  profileData: ProfileData | undefined,
  allAnytimeActionTasks: AnytimeActionTask[],
): AnytimeActionTask[] => {
  if (!profileData) return [];
  if (Object.keys(profileData.nonEssentialRadioAnswers).length === 0) return [];

  const anytimeActionIds = anytimeActionsToAdd(profileData.nonEssentialRadioAnswers);
  const anytimeActionsFromNonEssentialQuestions = allAnytimeActionTasks.filter((anytimeAction) =>
    anytimeActionIds.includes(anytimeAction.filename),
  );

  return anytimeActionsFromNonEssentialQuestions;
};

const anytimeActionsToAdd = (
  nonEssentialRadioAnswers: Record<string, boolean | undefined>,
): string[] => {
  let anytimeActionIds: string[] = [];

  for (const questionId in nonEssentialRadioAnswers) {
    const anytimeActionId = getNonEssentialQuestionAnytimeActions(questionId);
    anytimeActionIds = [...anytimeActionIds, ...anytimeActionId];
  }
  return anytimeActionIds;
};
