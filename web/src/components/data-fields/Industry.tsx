import { EmploymentAgency } from "@/components/data-fields/EmploymentAgency";
import { EssentialQuestionField } from "@/components/data-fields/EssentialQuestionField";
import { HomeContractor } from "@/components/data-fields/HomeContractor";
import { IndustryDropdown } from "@/components/data-fields/IndustryDropdown";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { EssentialQuestions } from "@/lib/domain-logic/essentialQuestions";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { FormContextFieldProps } from "@/lib/types/types";
import { ReactElement, ReactNode, useContext } from "react";

interface Props<T> extends FormContextFieldProps<T> {
  essentialQuestionErrorTypes?: T[];
  onboardingFieldLabel?: boolean;
}
export const Industry = <T,>(props: Props<T>): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  const fieldName = "industryId";

  const { RegisterForOnSubmit, Validate, isFormFieldInValid } = useFormContextFieldHelpers(
    fieldName,
    ProfileFormContext,
    props.errorTypes
  );

  const { Config } = useConfig();

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["industryId"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: fieldName,
    });

  const isValid = (value: string | undefined): boolean => !!value && value.length > 0;

  RegisterForOnSubmit(() => isValid(state.profileData.industryId));

  const getEssentialQuestions = (industryId: string | undefined): ReactNode[] => {
    return EssentialQuestions.filter((i) => {
      return i.isQuestionApplicableToIndustryId(industryId);
    }).map((obj) => (
      <EssentialQuestionField<T>
        essentialQuestion={obj}
        key={obj.fieldName}
        errorTypes={props.essentialQuestionErrorTypes}
        onboardingFieldLabel={props.onboardingFieldLabel}
      />
    ));
  };

  return (
    <>
      <IndustryDropdown
        error={isFormFieldInValid}
        validationLabel="Error"
        validationText={contentFromConfig.errorTextRequired}
        handleChange={(): void => Validate(false)}
        onValidation={(event): void => Validate(!isValid(event.target.value))}
      />
      {state.profileData.industryId === "home-contractor" && (
        <div
          className="margin-top-2"
          data-testid={`industry-specific-${state.profileData.industryId}`}
          key={state.profileData.industryId}
        >
          <HomeContractor />
        </div>
      )}
      {state.profileData.industryId === "employment-agency" && (
        <div
          className="margin-top-2"
          data-testid={`industry-specific-${state.profileData.industryId}`}
          key={state.profileData.industryId}
        >
          <EmploymentAgency />
        </div>
      )}
      {getEssentialQuestions(state.profileData.industryId)}
    </>
  );
};
