import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { IndustryDropdown } from "@/components/onboarding/IndustryDropdown";
import { OnboardingEmploymentAgency } from "@/components/onboarding/OnboardingEmploymentAgency";
import { OnboardingHomeContractor } from "@/components/onboarding/OnboardingHomeContractor";
import { OnboardingRadioQuestion } from "@/components/onboarding/OnboardingRadioQuestion";
import { WithErrorBar } from "@/components/WithErrorBar";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { EssentialQuestions } from "@/lib/domain-logic/essentialQuestions";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileContentField, ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { IndustrySpecificData, industrySpecificDataChoices } from "@businessnjgovnavigator/shared";
import { FocusEvent, ReactElement, useContext } from "react";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
}

export const OnboardingIndustry = (props: Props): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  const { Config } = useConfig();
  const fieldName = "industryId";

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["industryId"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: fieldName,
    });

  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const valid = event.target.value.length > 0;
    props.onValidation(fieldName, !valid);
  };

  const handleChange = (): void => {
    return props.onValidation(fieldName, false);
  };

  const getEssentialQuestions = (industryId: string | undefined) => {
    return EssentialQuestions.filter((i) => {
      return i.isQuestionApplicableToIndustryId(industryId);
    }).map((obj) => {
      const essentialQuestionContentFromConfig = getProfileConfig({
        config: Config,
        persona: state.flow,
        fieldName: (obj.contentFieldName ?? obj.fieldName) as ProfileContentField,
      });

      return (
        <div
          data-testid={`industry-specific-${industryId}-${obj.fieldName}`}
          key={`${industryId}-${obj.fieldName}`}
        >
          <WithErrorBar
            hasError={props.fieldStates[obj.fieldName].invalid}
            type="ALWAYS"
            className={
              essentialQuestionContentFromConfig.headerNotBolded || essentialQuestionContentFromConfig.header
                ? "margin-top-4"
                : "margin-top-2"
            }
          >
            <FieldLabelProfile fieldName={obj.contentFieldName ?? (obj.fieldName as ProfileContentField)} />
            <OnboardingRadioQuestion<IndustrySpecificData[keyof IndustrySpecificData]>
              {...obj}
              choices={industrySpecificDataChoices[obj.fieldName]}
              onValidation={props.onValidation}
            />
            {props.fieldStates[obj.fieldName].invalid && (
              <div className="text-error-dark text-bold margin-top-05">
                {Config.profileDefaults.essentialQuestionInlineText}
              </div>
            )}
          </WithErrorBar>
        </div>
      );
    });
  };

  return (
    <div className="form-input margin-top-2">
      <IndustryDropdown
        error={props.fieldStates[fieldName].invalid}
        validationLabel="Error"
        validationText={contentFromConfig.errorTextRequired}
        handleChange={handleChange}
        onValidation={onValidation}
      />
      {state.profileData.industryId === "home-contractor" && (
        <div
          className="margin-top-2"
          data-testid={`industry-specific-${state.profileData.industryId}`}
          key={state.profileData.industryId}
        >
          <OnboardingHomeContractor />
        </div>
      )}
      {state.profileData.industryId === "employment-agency" && (
        <div
          className="margin-top-2"
          data-testid={`industry-specific-${state.profileData.industryId}`}
          key={state.profileData.industryId}
        >
          <OnboardingEmploymentAgency />
        </div>
      )}
      {getEssentialQuestions(state.profileData.industryId)}
    </div>
  );
};
