import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { OnboardingRadioQuestion } from "@/components/onboarding/OnboardingRadioQuestion";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { NonEssentialQuestion } from "@/lib/domain-logic/nonEssentialQuestions";
import { FormContextFieldProps, ProfileContentField } from "@/lib/types/types";
import { IndustrySpecificData, industrySpecificDataChoices } from "@businessnjgovnavigator/shared/index";
import { ReactElement, useContext } from "react";

interface Props<T> extends FormContextFieldProps<T> {
  nonEssentialQuestion: NonEssentialQuestion;
}
export const ProfileNonEssentialQuestion = <T,>(props: Props<T>): ReactElement => {
  const { state } = useContext(ProfileDataContext);

  const { RegisterForOnSubmit } = useFormContextFieldHelpers(
    props.nonEssentialQuestion.fieldName,
    profileFormContext,
    props.errorTypes
  );

  RegisterForOnSubmit(() => state.profileData[props.nonEssentialQuestion.fieldName] !== undefined);

  return (
    <div
      data-testid={`industry-specific-${state.profileData.industryId}-${props.nonEssentialQuestion.fieldName}`}
      className={"margin-top-2"}
    >
      <FieldLabelProfile
        fieldName={props.nonEssentialQuestion.fieldName as ProfileContentField}
        boldDescription
      />
      <OnboardingRadioQuestion<IndustrySpecificData[keyof IndustrySpecificData]>
        {...props.nonEssentialQuestion}
        choices={industrySpecificDataChoices[props.nonEssentialQuestion.fieldName]}
      />
    </div>
  );
};
