import { EmploymentAgency } from "@/components/data-fields/EmploymentAgency";
import { EssentialQuestionField } from "@/components/data-fields/EssentialQuestionField";
import { HomeContractor } from "@/components/data-fields/HomeContractor";
import { IndustryDropdown } from "@/components/data-fields/IndustryDropdown";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { EssentialQuestion, EssentialQuestions } from "@/lib/domain-logic/essentialQuestions";
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

  const { RegisterForOnSubmit, setIsValid, isFormFieldInvalid } = useFormContextFieldHelpers(
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

  const shouldEssentialQuestionAppearBasedOnProfileData = (essentialQuestion: EssentialQuestion): boolean => {
    switch (essentialQuestion.fieldName) {
      case "residentialConstructionType":
        return (
          state.profileData.constructionType === "BOTH" ||
          state.profileData.constructionType === "RESIDENTIAL"
        );
      case "employmentPlacementType":
        return state.profileData.employmentPersonnelServiceType === "EMPLOYERS";
      case "hasThreeOrMoreRentalUnits":
        return (
          state.profileData.propertyLeaseType === "LONG_TERM_RENTAL" ||
          state.profileData.propertyLeaseType === "BOTH"
        );
      default:
        return true;
    }
  };

  const getEssentialQuestions = (industryId: string | undefined): ReactNode[] => {
    return EssentialQuestions.filter((i) => {
      return (
        i.isQuestionApplicableToIndustryId(industryId) && shouldEssentialQuestionAppearBasedOnProfileData(i)
      );
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
        error={isFormFieldInvalid}
        validationLabel="Error"
        validationText={contentFromConfig.errorTextRequired}
        handleChange={(): void => setIsValid(true)}
        onValidation={(event): void => setIsValid(isValid(event.target.value))}
      />
      {state.profileData.industryId === "home-contractor" && (
        <div
          className="margin-top-05"
          data-testid={`industry-specific-${state.profileData.industryId}`}
          key={state.profileData.industryId}
        >
          <HomeContractor />
        </div>
      )}
      {state.profileData.industryId === "employment-agency" && (
        <div
          className="margin-top-05"
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
