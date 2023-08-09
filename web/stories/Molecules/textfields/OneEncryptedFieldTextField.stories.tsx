import { GenericTextField } from "@/components/GenericTextField";
import { FieldLabelModal } from "@/components/onboarding/FieldLabelModal";
import { OnboardingTaxId } from "@/components/onboarding/taxId/OnboardingTaxId";
import { WithErrorBar } from "@/components/WithErrorBar";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { createProfileFieldErrorMap } from "@/lib/types/types";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { useState } from "react";

export default {
  title: "Molecules/TextField/OneEncryptedTextField",
  component: GenericTextField,
  decorators: [(Story) => <div className="width-desktop">{Story()}</div>],

  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System?type=design&node-id=2759%3A6193&mode=design&t=pO4kgZ2SOAWLzINQ-1",
    },
  },
} as ComponentMeta<typeof GenericTextField>;

const Template: ComponentStory<typeof GenericTextField> = (props) => {
  const [config, setConfig] = useState<ConfigType>(getMergedConfig());
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const { state: formContextState } = useFormContextHelper(createProfileFieldErrorMap());

  return (
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
        <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
          <ProfileDataContext.Provider
            value={{
              state: {
                profileData: profileData,
                flow: "STARTING",
              },
              setProfileData,
              onBack: (): void => {},
            }}
          >
            <h1>Using Modal Field Label Component</h1>

            <WithErrorBar hasError={false} type="ALWAYS" className="margin-top-2">
              <div data-testid="taxIdInput">
                <FieldLabelModal
                  fieldName="taxId"
                  overrides={{
                    header: "Header Text",
                    description:
                      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam gravida mattis magna et placerat. Aenean sagittis lectus neque, sed ultrices est fringilla eu. Vivamus non tellus ut dui auctor vehicula. Sed pellentesque nisi vel at blandit urna auctor ut.",
                    postDescription: "postDescription",
                    headerNotBolded: "UnBoldedHeader Text",
                  }}
                />
              </div>
              <OnboardingTaxId required />
            </WithErrorBar>

            <WithErrorBar hasError type="ALWAYS" className="margin-top-2">
              <div data-testid="taxIdInput">
                <FieldLabelModal
                  fieldName="taxId"
                  overrides={{
                    header: "Header Text",
                    description:
                      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam gravida mattis magna et placerat. Aenean sagittis lectus neque, sed ultrices est fringilla eu. Vivamus non tellus ut dui auctor vehicula. Sed pellentesque nisi vel at blandit urna auctor ut.",
                    postDescription: "postDescription",
                    headerNotBolded: "UnBoldedHeader Text",
                  }}
                />
              </div>
              <OnboardingTaxId validationText={config.taxAccess.failedTaxIdHelper} required error />
            </WithErrorBar>
          </ProfileDataContext.Provider>
        </ConfigContext.Provider>
      </AuthAlertContext.Provider>
    </profileFormContext.Provider>
  );
};

export const OneEncryptedTextField = Template.bind({});
OneEncryptedTextField.args = {};
