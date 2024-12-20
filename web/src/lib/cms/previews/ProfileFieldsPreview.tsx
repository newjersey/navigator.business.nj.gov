import { BusinessName } from "@/components/data-fields/BusinessName";
import { BusinessPersonaQuestion } from "@/components/data-fields/BusinessPersonaQuestion";
import { DateOfFormation } from "@/components/data-fields/DateOfFormation";
import { EmployerId } from "@/components/data-fields/EmployerId";
import { EntityId } from "@/components/data-fields/EntityId";
import { ExistingEmployees } from "@/components/data-fields/ExistingEmployees";
import { ForeignBusinessTypeField } from "@/components/data-fields/ForeignBusinessTypeField";
import { Industry } from "@/components/data-fields/Industry";
import { MunicipalityField } from "@/components/data-fields/MunicipalityField";
import { NaicsCode } from "@/components/data-fields/NaicsCode";
import { NexusBusinessNameField } from "@/components/data-fields/NexusBusinessNameField";
import { NexusDBANameField } from "@/components/data-fields/NexusDBANameField";
import { Notes } from "@/components/data-fields/Notes";
import { Ownership } from "@/components/data-fields/Ownership";
import { RadioQuestion } from "@/components/data-fields/RadioQuestion";
import { ResponsibleOwnerName } from "@/components/data-fields/ResponsibleOwnerName";
import { Sectors } from "@/components/data-fields/Sectors";
import { TaxId } from "@/components/data-fields/tax-id/TaxId";
import { TaxPin } from "@/components/data-fields/TaxPin";
import { FieldLabelOnboarding } from "@/components/field-labels/FieldLabelOnboarding";
import { FieldLabelProfile } from "@/components/field-labels/FieldLabelProfile";
import { Heading } from "@/components/njwds-extended/Heading";
import { ProfileDocuments } from "@/components/profile/ProfileDocuments";
import { LegalStructureRadio } from "@/components/tasks/business-structure/LegalStructureRadio";
import { ConfigContext } from "@/contexts/configContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { EssentialQuestions } from "@/lib/domain-logic/essentialQuestions";
import { createProfileFieldErrorMap, ProfileContentField } from "@/lib/types/types";
import { businessStructureTaskId } from "@businessnjgovnavigator/shared/";
import {
  IndustrySpecificData,
  industrySpecificDataChoices,
} from "@businessnjgovnavigator/shared/profileData";
import { ReactElement } from "react";

const ProfileFieldsPreview = (props: PreviewProps): ReactElement<any> => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const { state: formContextState } = useFormContextHelper(createProfileFieldErrorMap());
  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <ProfileFormContext.Provider value={formContextState}>
        <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
          <BusinessPersonaQuestion />
          <hr className="margin-y-4" />

          <div className="margin-left-4">
            <FieldLabelOnboarding fieldName="businessName" />
            <BusinessName />

            <div className="margin-y-2" />

            <FieldLabelOnboarding fieldName="businessName" CMS_ONLY_flow="OWNING" />
            <BusinessName />
          </div>
          <hr className="margin-y-4" />

          <FieldLabelOnboarding fieldName="industryId" />
          <Industry />
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
              <MunicipalityField />
            </div>

            <div className="margin-y-2" />

            <FieldLabelOnboarding fieldName="municipality" CMS_ONLY_flow="OWNING" />
            <div className="margin-top-2">
              <MunicipalityField />
            </div>

            <div className="margin-y-2" />

            <FieldLabelOnboarding fieldName="municipality" CMS_ONLY_flow="FOREIGN" />
            <div className="margin-top-2">
              <MunicipalityField />
            </div>
          </div>

          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="sectorId" />
          <Sectors />

          <hr className="margin-y-4" />

          <div className="margin-left-4">
            <FieldLabelOnboarding fieldName="ownershipTypeIds" />
            <Ownership />

            <div className="margin-y-2" />

            <FieldLabelOnboarding fieldName="ownershipTypeIds" CMS_ONLY_flow="OWNING" />
            <Ownership />
          </div>

          <hr className="margin-y-4" />

          <div className="margin-left-4">
            <FieldLabelOnboarding fieldName="existingEmployees" />
            <ExistingEmployees />

            <div className="margin-y-2" />

            <FieldLabelOnboarding fieldName="existingEmployees" CMS_ONLY_flow="OWNING" />
            <ExistingEmployees />
          </div>

          <hr className="margin-y-4" />

          <FieldLabelOnboarding fieldName="foreignBusinessTypeIds" />
          <ForeignBusinessTypeField />

          <hr className="margin-y-4" />

          <NexusBusinessNameField />

          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="nexusDbaName" />
          <NexusDBANameField />

          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="taxId" />
          <TaxId />

          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="entityId" />
          <EntityId />

          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="employerId" />
          <EmployerId />

          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="naicsCode" />
          <NaicsCode />

          <div className="margin-top-3">
            <Heading level={4}>----Input Label On Naics Code Task----</Heading>
            <FieldLabelProfile fieldName={"naicsCode"} isAltDescriptionDisplayed ignoreContextualInfo />
          </div>

          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="dateOfFormation" />
          <DateOfFormation futureAllowed={false} />

          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="taxPin" />
          <TaxPin />

          <hr className="margin-y-4" />
          <ProfileDocuments />

          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="notes" />
          <Notes />

          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="responsibleOwnerName" />
          <ResponsibleOwnerName />

          {EssentialQuestions.map((props, index) => {
            return (
              <div className="margin-top-4" key={props.fieldName + index}>
                <FieldLabelProfile fieldName={props.fieldName as ProfileContentField} />
                <RadioQuestion<IndustrySpecificData[keyof IndustrySpecificData]>
                  {...props}
                  choices={industrySpecificDataChoices[props.fieldName]}
                />
              </div>
            );
          })}
        </div>
      </ProfileFormContext.Provider>
    </ConfigContext.Provider>
  );
};

export default ProfileFieldsPreview;
