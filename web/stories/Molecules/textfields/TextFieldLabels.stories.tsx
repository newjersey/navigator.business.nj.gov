import { GenericTextField } from "@/components/GenericTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import { FieldLabelDescriptionOnly } from "@/components/onboarding/FieldLabelDescriptionOnly";
import { FieldLabelModal } from "@/components/onboarding/FieldLabelModal";
import { FieldLabelOnboarding } from "@/components/onboarding/FieldLabelOnboarding";
import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { ProfileBusinessStructure } from "@/components/profile/ProfileBusinessStructure";
import { ProfileField } from "@/components/profile/ProfileField";
import { ProfileNaicsCode } from "@/components/profile/ProfileNaicsCode";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { createEmptyDbaDisplayContent, createProfileFieldErrorMap } from "@/lib/types/types";
import {
  generateFormationFormData,
  generateProfileData,
  LookupLegalStructureById,
} from "@businessnjgovnavigator/shared/";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { useState } from "react";

export default {
  title: "Molecules/TextField/TextFieldLabels",
  component: GenericTextField,
  decorators: [(Story) => <div className="width-mobile-lg">{Story()}</div>],

  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System?type=design&node-id=2759%3A6193&mode=design&t=pO4kgZ2SOAWLzINQ-1",
    },
  },
} as ComponentMeta<typeof GenericTextField>;

const Template: ComponentStory<typeof GenericTextField> = (props) => {
  const mergedConfig = getMergedConfig();
  mergedConfig.profileDefaults.fields.legalStructureId.onboarding = {
    ...mergedConfig.profileDefaults.fields.legalStructureId.onboarding,
    default: {
      ...mergedConfig.profileDefaults.fields.legalStructureId.onboarding.default,
      header: "Header Text",
    },
    overrides: {
      ...mergedConfig.profileDefaults.fields.legalStructureId.onboarding.overrides,

      OWNING: {
        ...mergedConfig.profileDefaults.fields.legalStructureId.onboarding.overrides.OWNING,
        description: "Description Text \n \n Second Paragraph",
      },
    },
  };
  const [Config, setConfig] = useState<ConfigType>(mergedConfig);
  const [profileData, setProfileData] = useState<ProfileData>(
    generateProfileData({ taxId: "2", naicsCode: "" })
  );
  const { state: formContextState } = useFormContextHelper(createProfileFieldErrorMap());

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
      <profileFormContext.Provider value={formContextState}>
        <AuthAlertContext.Provider
          value={{
            isAuthenticated: IsAuthenticated.UNKNOWN,
            registrationAlertStatus: undefined,
            registrationAlertIsVisible: false,
            setRegistrationAlertStatus: () => {},
            setRegistrationAlertIsVisible: () => {},
            registrationModalIsVisible: false,
            setRegistrationModalIsVisible: () => {},
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
                <FieldLabelDescriptionOnly fieldName="legalStructureId" />
              </div>

              <div>FieldLabelOnboarding Component</div>
              <div className={"border margin-bottom-4"}>
                <FieldLabelOnboarding fieldName="legalStructureId" />
              </div>

              <div>FieldLabelProfile Component</div>
              <div className={"border margin-bottom-4"}>
                <FieldLabelProfile fieldName="legalStructureId" />
              </div>

              <div>FieldLabelFormation Component</div>
              <div className={"border margin-bottom-4"}>
                <strong>
                  <ModifiedContent>
                    {Config.profileDefaults.fields.legalStructureId.onboarding.default.header}
                  </ModifiedContent>
                </strong>
              </div>

              <div>ProfileField Component</div>
              <div className={"border margin-bottom-4"}>
                <ProfileField fieldName="legalStructureId">Children content is displayed here</ProfileField>
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
                  <ProfileBusinessStructure />
                </ProfileField>
              </div>

              <div>ProfileField Component With Add Button</div>
              <div className={"border margin-bottom-4"}>
                <ProfileField fieldName="naicsCode" noLabel={true}>
                  <ProfileNaicsCode />
                </ProfileField>
              </div>
            </ProfileDataContext.Provider>
          </ConfigContext.Provider>
        </AuthAlertContext.Provider>
      </profileFormContext.Provider>
    </BusinessFormationContext.Provider>
  );
};

export const TextFieldLabels = Template.bind({});
TextFieldLabels.args = {};
