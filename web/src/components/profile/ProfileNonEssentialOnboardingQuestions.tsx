import { ProfileNonEssentialQuestion } from "@/components/profile/ProfileNonEssentialQuestion";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { NonEssentialQuestions } from "@/lib/domain-logic/nonEssentialQuestions";
import { ProfileContentField } from "@/lib/types/types";
import { ReactElement, useContext } from "react";

export const ProfileNonEssentialOnboardingQuestions = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  const filteredQuestions = NonEssentialQuestions.filter((question) => {
    const contentFromConfig = getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: question.fieldName as ProfileContentField,
    });

    const contentFlowMatchesCurrentFlow = (): boolean => {
      if (contentFromConfig.flow === "BOTH") {
        return state.flow === "STARTING" || state.flow === "FOREIGN";
      }
      return state.flow === contentFromConfig.flow;
    };

    return (
      question.isQuestionApplicableToIndustryId(state.profileData.industryId) &&
      contentFlowMatchesCurrentFlow()
    );
  });

  const mappedQuestions = filteredQuestions.map((obj) => (
    <ProfileNonEssentialQuestion nonEssentialQuestion={obj} key={obj.fieldName} />
  ));

  return (
    <>
      {mappedQuestions.length > 0 && (
        <div className={"margin-top-3"}>
          {Config.profileDefaults.fields.nonEssentialQuestions.default.header}
        </div>
      )}
      {mappedQuestions}
    </>
  );
};
