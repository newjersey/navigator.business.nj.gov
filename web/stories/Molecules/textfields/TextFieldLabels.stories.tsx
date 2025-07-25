import { BusinessStructure } from "@/components/data-fields/BusinessStructure";
import { NaicsCode } from "@/components/data-fields/NaicsCode";
import { FieldLabelDescriptionOnly } from "@/components/field-labels/FieldLabelDescriptionOnly";
import { FieldLabelModal } from "@/components/field-labels/FieldLabelModal";
import { FieldLabelOnboarding } from "@/components/field-labels/FieldLabelOnboarding";
import { FieldLabelProfile } from "@/components/field-labels/FieldLabelProfile";
import { ModifiedContent } from "@/components/ModifiedContent";
import { ProfileField } from "@/components/profile/ProfileField";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { createEmptyDbaDisplayContent } from "@/lib/types/types";
import {
  generateFormationFormData,
  generateProfileData,
  LookupLegalStructureById,
} from "@businessnjgovnavigator/shared/";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const Template = () => {
  const mergedConfig = getMergedConfig();
  const [Config, setConfig] = useState<ConfigType>(mergedConfig);
  const [profileData, setProfileData] = useState<ProfileData>(
    generateProfileData({ taxId: "2", naicsCode: "" }),
  );
  const { state: formContextState } = useFormContextHelper(createDataFormErrorMap());

  return (
    <BusinessFormationContext.Provider
      value={{
        state: {
          stepIndex: 1,
          formationFormData: generateFormationFormData({}),
          dbaContent: createEmptyDbaDisplayContent(),
          showResponseAlert: false,
          hasBeenSubmitted: false,
          interactedFields: [],
          foreignGoodStandingFile: undefined,
          hasSetStateFirstTime: false,
          businessNameAvailability: undefined,
          dbaBusinessNameAvailability: undefined,
        },
        setFormationFormData: () => {},
        setBusinessNameAvailability: () => {},
        setDbaBusinessNameAvailability: () => {},
        setStepIndex: () => {},
        setShowResponseAlert: () => {},
        setFieldsInteracted: () => {},
        setHasBeenSubmitted: () => {},
        setForeignGoodStandingFile: () => {},
      }}
    >
      <DataFormErrorMapContext.Provider value={formContextState}>
        <NeedsAccountContext.Provider
          value={{
            isAuthenticated: IsAuthenticated.UNKNOWN,
            registrationStatus: undefined,
            showNeedsAccountSnackbar: false,
            setRegistrationStatus: () => {},
            setShowNeedsAccountSnackbar: () => {},
            showNeedsAccountModal: false,
            setShowNeedsAccountModal: () => {},
            showContinueWithoutSaving: false,
            setShowContinueWithoutSaving: () => {},
            userWantsToContinueWithoutSaving: false,
            setUserWantsToContinueWithoutSaving: () => {},
          }}
        >
          <ConfigContext.Provider value={{ config: Config, setOverrides: setConfig }}>
            <ProfileDataContext.Provider
              value={{
                state: {
                  profileData: profileData,
                  flow: "OWNING",
                },
                setProfileData,
                onBack: (): void => {},
              }}
            >
              <div>FieldLabelModal Component</div>
              <div className={"border margin-bottom-4"}>
                <FieldLabelModal
                  fieldName="businessName"
                  overrides={{
                    header: "Header Text",
                    description: "Description Text \n \n Second Paragraph",
                    headerNotBolded: "Not Bolded Header Text",
                    postDescription: "Post Description Text \n \n Second Paragraph",
                  }}
                />
              </div>

              <div>FieldLabelDescriptionOnly Component</div>
              <div className={"border margin-bottom-4"}>
                <FieldLabelDescriptionOnly fieldName="industryId" />
              </div>

              <div>FieldLabelOnboarding Component</div>
              <div className={"border margin-bottom-4"}>
                <FieldLabelOnboarding fieldName="industryId" />
              </div>

              <div>FieldLabelProfile Component</div>
              <div className={"border margin-bottom-4"}>
                <FieldLabelProfile fieldName="industryId" />
              </div>

              <div>FieldLabelFormation Component</div>
              <div className={"border margin-bottom-4"}>
                <strong>
                  <ModifiedContent>
                    {Config.profileDefaults.fields.industryId.default.header}
                  </ModifiedContent>
                </strong>
              </div>

              <div>ProfileField Component</div>
              <div className={"border margin-bottom-4"}>
                <ProfileField fieldName="industryId">
                  Children content is displayed here
                </ProfileField>
              </div>

              <div>ProfileField Component When Locked</div>
              <div className={"border margin-bottom-4"}>
                <ProfileField
                  fieldName="legalStructureId"
                  noLabel={true}
                  locked
                  lockedValueFormatter={(legalStructureId): string =>
                    LookupLegalStructureById(legalStructureId).name
                  }
                >
                  <BusinessStructure />
                </ProfileField>
              </div>

              <div>ProfileField Component With Add Button</div>
              <div className={"border margin-bottom-4"}>
                <ProfileField fieldName="naicsCode" noLabel={true}>
                  <NaicsCode />
                </ProfileField>
              </div>
            </ProfileDataContext.Provider>
          </ConfigContext.Provider>
        </NeedsAccountContext.Provider>
      </DataFormErrorMapContext.Provider>
    </BusinessFormationContext.Provider>
  );
};

const meta: Meta<typeof Template> = {
  title: "Molecules/TextField/TextFieldLabels",
  component: Template,
  decorators: [(Story) => <div className="width-mobile-lg">{Story()}</div>],

  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System?type=design&node-id=2759%3A6193&mode=design&t=pO4kgZ2SOAWLzINQ-1",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Template>;

export const TextFieldLabels: Story = {};
