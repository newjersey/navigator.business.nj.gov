import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { OnboardingRadioQuestion } from "@/components/onboarding/OnboardingRadioQuestion";
import { WithErrorBar } from "@/components/WithErrorBar";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { EssentialQuestion } from "@/lib/domain-logic/essentialQuestions";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { FormContextFieldProps, ProfileContentField } from "@/lib/types/types";
import { IndustrySpecificData, industrySpecificDataChoices } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

interface Props<T> extends FormContextFieldProps<T> {
  essentialQuestion: EssentialQuestion;
}
export const OnboardingEssentialQuestion = <T,>(props: Props<T>): ReactElement => {
  const { state } = useContext(ProfileDataContext);

  const { RegisterForOnSubmit, isFormFieldInValid } = useFormContextFieldHelpers(
    props.essentialQuestion.fieldName,
    profileFormContext,
    props.errorTypes
  );

  const { Config } = useConfig();
  const essentialQuestionContentFromConfig = getProfileConfig({
    config: Config,
    persona: state.flow,
    fieldName: props.essentialQuestion.fieldName as ProfileContentField,
  });
  RegisterForOnSubmit(() => state.profileData[props.essentialQuestion.fieldName] !== undefined);

  return (
    <div
      data-testid={`industry-specific-${state.profileData.industryId}-${props.essentialQuestion.fieldName}`}
    >
      <WithErrorBar
        hasError={isFormFieldInValid}
        type="ALWAYS"
        className={
          essentialQuestionContentFromConfig.headerNotBolded || essentialQuestionContentFromConfig.header
            ? "margin-top-4"
            : "margin-top-2"
        }
      >
        <FieldLabelProfile fieldName={props.essentialQuestion.fieldName as ProfileContentField} />
        <OnboardingRadioQuestion<IndustrySpecificData[keyof IndustrySpecificData]>
          {...props.essentialQuestion}
          choices={industrySpecificDataChoices[props.essentialQuestion.fieldName]}
        />
        {isFormFieldInValid && (
          <div className="text-error-dark text-bold margin-top-05">
            {Config.profileDefaults.essentialQuestionInlineText}
          </div>
        )}
      </WithErrorBar>
    </div>
  );
};
