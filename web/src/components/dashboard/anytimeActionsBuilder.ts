import type { ProfileData } from "@businessnjgovnavigator/shared/profileData";
import type { AnytimeActionTask } from "@businessnjgovnavigator/shared/types";
import { getNonEssentialQuestionAnytimeActions } from "@/lib/domain-logic/getNonEssentialQuestionAnytimeActions";

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

  for (const [questionId, response] of Object.entries(nonEssentialRadioAnswers)) {
    if (response) {
      const anytimeActionId = getNonEssentialQuestionAnytimeActions(questionId);
      anytimeActionIds = [...anytimeActionIds, ...anytimeActionId];
    }
  }
  return anytimeActionIds;
};
