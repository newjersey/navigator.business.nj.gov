import { FieldLabelOnboarding } from "@/components/onboarding/FieldLabelOnboarding";
import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { OnboardingBusinessName } from "@/components/onboarding/OnboardingBusinessName";
import { OnboardingBusinessPersona } from "@/components/onboarding/OnboardingBusinessPersona";
import { OnboardingDateOfFormation } from "@/components/onboarding/OnboardingDateOfFormation";
import { OnboardingEmployerId } from "@/components/onboarding/OnboardingEmployerId";
import { OnboardingEntityId } from "@/components/onboarding/OnboardingEntityId";
import { OnboardingExistingEmployees } from "@/components/onboarding/OnboardingExistingEmployees";
import { OnboardingForeignBusinessType } from "@/components/onboarding/OnboardingForeignBusinessType";
import { OnboardingIndustry } from "@/components/onboarding/OnboardingIndustry";
import { OnboardingLegalStructure } from "@/components/onboarding/OnboardingLegalStructure";
import { OnboardingLocationInNewJersey } from "@/components/onboarding/OnboardingLocationInNewJersey";
import { OnboardingMunicipality } from "@/components/onboarding/OnboardingMunicipality";
import { OnboardingNotes } from "@/components/onboarding/OnboardingNotes";
import { OnboardingOwnership } from "@/components/onboarding/OnboardingOwnership";
import { OnboardingRadioQuestion } from "@/components/onboarding/OnboardingRadioQuestion";
import { OnboardingResponsibleOwnerName } from "@/components/onboarding/OnboardingResponsibleOwnerName";
import { OnboardingSectors } from "@/components/onboarding/OnboardingSectors";
import { OnboardingTaxPin } from "@/components/onboarding/OnboardingTaxPin";
import { ProfileNaicsCode } from "@/components/onboarding/ProfileNaicsCode";
import { ProfileNexusBusinessNameField } from "@/components/onboarding/ProfileNexusBusinessNameField";
import { ProfileNexusDBANameField } from "@/components/onboarding/ProfileNexusDBANameField";
import { Documents } from "@/components/profile/Documents";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { EssentialQuestions } from "@/lib/domain-logic/essentialQuestions";
import { createProfileFieldErrorMap, ProfileContentField } from "@/lib/types/types";
import {
  IndustrySpecificData,
  industrySpecificDataChoices,
} from "@businessnjgovnavigator/shared/profileData";

const ProfileFieldsPreview = (props: PreviewProps) => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const fieldStates = createProfileFieldErrorMap();

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <OnboardingBusinessPersona />
        <hr className="margin-y-4" />

        <div className="margin-left-4">
          <FieldLabelOnboarding fieldName="businessName" />
          <OnboardingBusinessName onValidation={() => {}} fieldStates={fieldStates} />

          <div className="margin-y-2" />

          <FieldLabelOnboarding fieldName="businessName" CMS_ONLY_flow="OWNING" />
          <OnboardingBusinessName onValidation={() => {}} fieldStates={fieldStates} />
        </div>
        <hr className="margin-y-4" />

        <FieldLabelOnboarding fieldName="industryId" />
        <OnboardingIndustry onValidation={() => {}} fieldStates={fieldStates} />
        <hr className="margin-y-4" />

        <div className="margin-left-4">
          <FieldLabelOnboarding fieldName="legalStructureId" />
          <OnboardingLegalStructure />

          <div className="margin-y-2" />

          <FieldLabelOnboarding fieldName="legalStructureId" CMS_ONLY_flow="FOREIGN" />
          <OnboardingLegalStructure />
        </div>

        <hr className="margin-y-4" />

        <div className="margin-left-4">
          <FieldLabelOnboarding fieldName="municipality" />
          <div className="margin-top-2">
            <OnboardingMunicipality onValidation={() => {}} fieldStates={fieldStates} />
          </div>

          <div className="margin-y-2" />

          <FieldLabelOnboarding fieldName="municipality" CMS_ONLY_flow="OWNING" />
          <div className="margin-top-2">
            <OnboardingMunicipality onValidation={() => {}} fieldStates={fieldStates} />
          </div>

          <div className="margin-y-2" />

          <FieldLabelOnboarding fieldName="municipality" CMS_ONLY_flow="FOREIGN" />
          <div className="margin-top-2">
            <OnboardingMunicipality onValidation={() => {}} fieldStates={fieldStates} />
          </div>
        </div>

        <hr className="margin-y-4" />
        <FieldLabelOnboarding fieldName="sectorId" />
        <OnboardingSectors onValidation={() => {}} fieldStates={fieldStates} />

        <hr className="margin-y-4" />

        <div className="margin-left-4">
          <FieldLabelOnboarding fieldName="ownershipTypeIds" />
          <OnboardingOwnership />

          <div className="margin-y-2" />

          <FieldLabelOnboarding fieldName="ownershipTypeIds" CMS_ONLY_flow="OWNING" />
          <OnboardingOwnership />
        </div>

        <hr className="margin-y-4" />

        <div className="margin-left-4">
          <FieldLabelOnboarding fieldName="existingEmployees" />
          <OnboardingExistingEmployees onValidation={() => {}} fieldStates={fieldStates} />

          <div className="margin-y-2" />

          <FieldLabelOnboarding fieldName="existingEmployees" CMS_ONLY_flow="OWNING" />
          <OnboardingExistingEmployees onValidation={() => {}} fieldStates={fieldStates} />
        </div>

        <hr className="margin-y-4" />

        <FieldLabelOnboarding fieldName="foreignBusinessTypeIds" />
        <OnboardingForeignBusinessType />

        <hr className="margin-y-4" />

        <FieldLabelOnboarding fieldName="nexusLocationInNewJersey" />
        <OnboardingLocationInNewJersey />

        <hr className="margin-y-4" />
        <ProfileNexusBusinessNameField />

        <hr className="margin-y-4" />
        <FieldLabelOnboarding fieldName="nexusDbaName" />
        <ProfileNexusDBANameField />

        <hr className="margin-y-4" />
        <FieldLabelOnboarding fieldName="entityId" />
        <OnboardingEntityId onValidation={() => {}} fieldStates={fieldStates} />

        <hr className="margin-y-4" />
        <FieldLabelOnboarding fieldName="employerId" />
        <OnboardingEmployerId onValidation={() => {}} fieldStates={fieldStates} />

        <hr className="margin-y-4" />
        <FieldLabelOnboarding fieldName="naicsCode" />
        <ProfileNaicsCode />

        <hr className="margin-y-4" />
        <FieldLabelOnboarding fieldName="dateOfFormation" />
        <OnboardingDateOfFormation futureAllowed={false} onValidation={() => {}} fieldStates={fieldStates} />

        <hr className="margin-y-4" />
        <FieldLabelOnboarding fieldName="taxPin" />
        <OnboardingTaxPin onValidation={() => {}} fieldStates={fieldStates} />

        <hr className="margin-y-4" />
        <Documents />

        <hr className="margin-y-4" />
        <FieldLabelOnboarding fieldName="notes" />
        <OnboardingNotes />

        <hr className="margin-y-4" />
        <FieldLabelOnboarding fieldName="responsibleOwnerName" />
        <OnboardingResponsibleOwnerName />

        {EssentialQuestions.map((props) => {
          return (
            <div className="margin-top-4" key={props.fieldName}>
              <FieldLabelProfile
                fieldName={props.contentFieldName ?? (props.fieldName as ProfileContentField)}
              />
              <OnboardingRadioQuestion<IndustrySpecificData[keyof IndustrySpecificData]>
                {...props}
                choices={industrySpecificDataChoices[props.fieldName]}
              />
            </div>
          );
        })}
      </div>
    </ConfigContext.Provider>
  );
};

export default ProfileFieldsPreview;
