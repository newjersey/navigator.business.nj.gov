import { NonEssentialQuestion } from "@/components/data-fields/non-essential-questions/NonEssentialQuestion";
import { RadioQuestion } from "@/components/data-fields/RadioQuestion";
import { ProfileField } from "@/components/profile/ProfileField";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { ProfileContentField } from "@/lib/types/types";
import {
  doesIndustryHaveNonEssentialQuestions,
  getPersonaBasedNonEssentialQuestionsIds,
} from "@/lib/utils/non-essential-questions-helpers";
import { LookupIndustryById } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

export const NonEssentialQuestionsSection = (): ReactElement => {
  const { state } = useContext(ProfileDataContext);

  const nonEssentialQuestions = (): ReactElement[] => {
    const nonEssentialQuestionsArray: ReactElement[] = [];
    const questionIds = LookupIndustryById(state.profileData.industryId).nonEssentialQuestionsIds;
    for (const question of questionIds) {
      nonEssentialQuestionsArray.push(
        <NonEssentialQuestion key={question} essentialQuestionId={question} />,
      );
    }

    return nonEssentialQuestionsArray;
  };

  const NonEssentialQuestionForPersonas = (props: {
    questionId: ProfileContentField;
  }): ReactElement => {
    return (
      <div data-testid="non-essential-questions-wrapper">
        <ProfileField
          fieldName={props.questionId}
          isVisible
          hideHeader
          hideLine
          fullWidth
          boldAltDescription
          boldDescription
          optionalText
        >
          <RadioQuestion<boolean> fieldName={props.questionId} choices={[true, false]} />
        </ProfileField>
      </div>
    );
  };

  return (
    <>
      {doesIndustryHaveNonEssentialQuestions(state.profileData) && (
        <div data-testid="non-essential-questions-wrapper">{nonEssentialQuestions()}</div>
      )}
      {getPersonaBasedNonEssentialQuestionsIds(state.profileData).map((questionId) => {
        return <NonEssentialQuestionForPersonas questionId={questionId} key={questionId} />;
      })}
    </>
  );
};
