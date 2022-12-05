import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { IndustryDropdown } from "@/components/onboarding/IndustryDropdown";
import { OnboardingEmploymentAgency } from "@/components/onboarding/OnboardingEmploymentAgency";
import { OnboardingHomeContractor } from "@/components/onboarding/OnboardingHomeContractor";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { EssentialQuestions } from "@/lib/domain-logic/essentialQuestions";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileContentField, ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { IndustrySpecificData, industrySpecificDataChoices } from "@businessnjgovnavigator/shared";
import { FocusEvent, ReactElement, useContext } from "react";
import { OnboardingRadioQuestion } from "./OnboardingRadioQuestion";

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
    }).map((props) => {
      return (
        <div className="margin-top-4" data-testid={`industry-specific-${industryId}`} key={industryId}>
          <FieldLabelProfile fieldName={props.contentFieldName ?? (props.fieldName as ProfileContentField)} />
          <OnboardingRadioQuestion<IndustrySpecificData[keyof IndustrySpecificData]>
            {...props}
            choices={industrySpecificDataChoices[props.fieldName]}
          />
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
