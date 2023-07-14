import { FieldLabelOnboarding } from "@/components/onboarding/FieldLabelOnboarding";
import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { OnboardingRadioQuestion } from "@/components/onboarding/OnboardingRadioQuestion";
import { WithErrorBar } from "@/components/WithErrorBar";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { EssentialQuestion } from "@/lib/domain-logic/essentialQuestions";
import { FormContextFieldProps, ProfileContentField } from "@/lib/types/types";
import { IndustrySpecificData, industrySpecificDataChoices } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

interface Props<T> extends FormContextFieldProps<T> {
  essentialQuestion: EssentialQuestion;
  onboardingFieldLabel?: boolean;
}
export const OnboardingEssentialQuestion = <T,>(props: Props<T>): ReactElement => {
  const { state } = useContext(ProfileDataContext);

  const { RegisterForOnSubmit, isFormFieldInValid } = useFormContextFieldHelpers(
    props.essentialQuestion.fieldName,
    profileFormContext,
    props.errorTypes
  );

  const { Config } = useConfig();
  RegisterForOnSubmit(() => state.profileData[props.essentialQuestion.fieldName] !== undefined);

  return (
    <div
      data-testid={`industry-specific-${state.profileData.industryId}-${props.essentialQuestion.fieldName}`}
    >
      <WithErrorBar hasError={isFormFieldInValid} type="ALWAYS" className="margin-top-2">
        {props.onboardingFieldLabel ? (
          <div data-testid={"FieldLabelOnboarding"}>
            <FieldLabelOnboarding fieldName={props.essentialQuestion.fieldName as ProfileContentField} />
          </div>
        ) : (
          <div data-testid={"FieldLabelProfile"}>
            <FieldLabelProfile fieldName={props.essentialQuestion.fieldName as ProfileContentField} />
          </div>
        )}

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
