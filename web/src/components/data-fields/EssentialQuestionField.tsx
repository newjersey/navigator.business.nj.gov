import { RadioQuestion } from "@/components/data-fields/RadioQuestion";
import { FieldLabelOnboarding } from "@/components/field-labels/FieldLabelOnboarding";
import { FieldLabelProfile } from "@/components/field-labels/FieldLabelProfile";
import { WithErrorBar } from "@/components/WithErrorBar";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
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
export const EssentialQuestionField = <T,>(props: Props<T>): ReactElement => {
  const { state } = useContext(ProfileDataContext);

  const { RegisterForOnSubmit, isFormFieldInvalid } = useFormContextFieldHelpers(
    props.essentialQuestion.fieldName,
    ProfileFormContext,
    props.errorTypes
  );

  const { Config } = useConfig();
  RegisterForOnSubmit(() => state.profileData[props.essentialQuestion.fieldName] !== undefined);

  return (
    <div
      data-testid={`industry-specific-${state.profileData.industryId}-${props.essentialQuestion.fieldName}`}
    >
      <WithErrorBar hasError={isFormFieldInvalid} type="ALWAYS" className="margin-top-4">
        {props.onboardingFieldLabel ? (
          <div data-testid={"FieldLabelOnboarding"}>
            <FieldLabelOnboarding fieldName={props.essentialQuestion.fieldName as ProfileContentField} />
          </div>
        ) : (
          <div data-testid={"FieldLabelProfile"}>
            <FieldLabelProfile fieldName={props.essentialQuestion.fieldName as ProfileContentField} />
          </div>
        )}

        <RadioQuestion<IndustrySpecificData[keyof IndustrySpecificData]>
          {...props.essentialQuestion}
          choices={industrySpecificDataChoices[props.essentialQuestion.fieldName]}
        />
        {isFormFieldInvalid && (
          <div className="text-error-dark text-bold margin-top-05">
            {Config.siteWideErrorMessages.errorRadioButton}
          </div>
        )}
      </WithErrorBar>
    </div>
  );
};
