import { FieldLabelOnboarding } from "@/components/onboarding/FieldLabelOnboarding";
import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { OnboardingBusinessPersona } from "@/components/onboarding/OnboardingBusinessPersona";
import { OnboardingForeignBusinessType } from "@/components/onboarding/OnboardingForeignBusinessType";
import { OnboardingIndustry } from "@/components/onboarding/OnboardingIndustry";
import { OnboardingLocationInNewJersey } from "@/components/onboarding/OnboardingLocationInNewJersey";
import { OnboardingRadioQuestion } from "@/components/onboarding/OnboardingRadioQuestion";
import { OnboardingSectors } from "@/components/onboarding/OnboardingSectors";
import { OnboardingTaxId } from "@/components/onboarding/taxId/OnboardingTaxId";
import { Documents } from "@/components/profile/Documents";
import { ProfileBusinessName } from "@/components/profile/ProfileBusinessName";
import { ProfileDateOfFormation } from "@/components/profile/ProfileDateOfFormation";
import { ProfileEmployerId } from "@/components/profile/ProfileEmployerId";
import { ProfileEntityId } from "@/components/profile/ProfileEntityId";
import { ProfileExistingEmployees } from "@/components/profile/ProfileExistingEmployees";
import { ProfileMunicipality } from "@/components/profile/ProfileMunicipality";
import { ProfileNaicsCode } from "@/components/profile/ProfileNaicsCode";
import { ProfileNexusBusinessNameField } from "@/components/profile/ProfileNexusBusinessNameField";
import { ProfileNexusDBANameField } from "@/components/profile/ProfileNexusDBANameField";
import { ProfileNotes } from "@/components/profile/ProfileNotes";
import { ProfileOwnership } from "@/components/profile/ProfileOwnership";
import { ProfileResponsibleOwnerName } from "@/components/profile/ProfileResponsibleOwnerName";
import { ProfileTaxPin } from "@/components/profile/ProfileTaxPin";
import { LegalStructureRadio } from "@/components/tasks/business-structure/LegalStructureRadio";
import { ConfigContext } from "@/contexts/configContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { EssentialQuestions } from "@/lib/domain-logic/essentialQuestions";
import { NonEssentialQuestions } from "@/lib/domain-logic/nonEssentialQuestions";
import { createProfileFieldErrorMap, ProfileContentField } from "@/lib/types/types";
import { businessStructureTaskId } from "@businessnjgovnavigator/shared/";
import {
  IndustrySpecificData,
  industrySpecificDataChoices,
} from "@businessnjgovnavigator/shared/profileData";
import { ReactElement } from "react";

const ProfileFieldsPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const { state: formContextState } = useFormContextHelper(createProfileFieldErrorMap());
  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <profileFormContext.Provider value={formContextState}>
        <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
          <OnboardingBusinessPersona />
          <hr className="margin-y-4" />

          <div className="margin-left-4">
            <FieldLabelOnboarding fieldName="businessName" />
            <ProfileBusinessName />

            <div className="margin-y-2" />

            <FieldLabelOnboarding fieldName="businessName" CMS_ONLY_flow="OWNING" />
            <ProfileBusinessName />
          </div>
          <hr className="margin-y-4" />

          <FieldLabelOnboarding fieldName="industryId" />
          <OnboardingIndustry />
          <hr className="margin-y-4" />

          <div className="margin-left-4">
            <FieldLabelOnboarding fieldName="legalStructureId" />
            <LegalStructureRadio taskId={businessStructureTaskId} />

            <div className="margin-y-2" />

            <FieldLabelOnboarding fieldName="legalStructureId" CMS_ONLY_flow="FOREIGN" />
            <LegalStructureRadio taskId={businessStructureTaskId} />
          </div>

          <hr className="margin-y-4" />

          <div className="margin-left-4">
            <FieldLabelOnboarding fieldName="municipality" />
            <div className="margin-top-2">
              <ProfileMunicipality />
            </div>

            <div className="margin-y-2" />

            <FieldLabelOnboarding fieldName="municipality" CMS_ONLY_flow="OWNING" />
            <div className="margin-top-2">
              <ProfileMunicipality />
            </div>

            <div className="margin-y-2" />

            <FieldLabelOnboarding fieldName="municipality" CMS_ONLY_flow="FOREIGN" />
            <div className="margin-top-2">
              <ProfileMunicipality />
            </div>
          </div>

          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="sectorId" />
          <OnboardingSectors />

          <hr className="margin-y-4" />

          <div className="margin-left-4">
            <FieldLabelOnboarding fieldName="ownershipTypeIds" />
            <ProfileOwnership />

            <div className="margin-y-2" />

            <FieldLabelOnboarding fieldName="ownershipTypeIds" CMS_ONLY_flow="OWNING" />
            <ProfileOwnership />
          </div>

          <hr className="margin-y-4" />

          <div className="margin-left-4">
            <FieldLabelOnboarding fieldName="existingEmployees" />
            <ProfileExistingEmployees />

            <div className="margin-y-2" />

            <FieldLabelOnboarding fieldName="existingEmployees" CMS_ONLY_flow="OWNING" />
            <ProfileExistingEmployees />
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
          <FieldLabelOnboarding fieldName="taxId" />
          <OnboardingTaxId />

          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="entityId" />
          <ProfileEntityId />

          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="employerId" />
          <ProfileEmployerId />

          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="naicsCode" />
          <ProfileNaicsCode />

          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="dateOfFormation" />
          <ProfileDateOfFormation futureAllowed={false} />

          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="taxPin" />
          <ProfileTaxPin />

          <hr className="margin-y-4" />
          <Documents />

          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="notes" />
          <ProfileNotes />

          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="responsibleOwnerName" />
          <ProfileResponsibleOwnerName />

          {EssentialQuestions.map((props, index) => {
            return (
              <div className="margin-top-4" key={props.fieldName + index}>
                <FieldLabelProfile fieldName={props.fieldName as ProfileContentField} />
                <OnboardingRadioQuestion<IndustrySpecificData[keyof IndustrySpecificData]>
                  {...props}
                  choices={industrySpecificDataChoices[props.fieldName]}
                />
              </div>
            );
          })}

          <hr className="margin-y-4" />

          <div>{config.profileDefaults.fields.nonEssentialQuestions.default.header}</div>

          {NonEssentialQuestions.map((props, index) => {
            return (
              <div className="margin-top-4" key={props.fieldName + index}>
                <FieldLabelProfile fieldName={props.fieldName as ProfileContentField} />
                <OnboardingRadioQuestion<IndustrySpecificData[keyof IndustrySpecificData]>
                  {...props}
                  choices={industrySpecificDataChoices[props.fieldName]}
                />
              </div>
            );
          })}
        </div>
      </profileFormContext.Provider>
    </ConfigContext.Provider>
  );
};

export default ProfileFieldsPreview;
