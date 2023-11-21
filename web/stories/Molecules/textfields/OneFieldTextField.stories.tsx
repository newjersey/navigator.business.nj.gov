import { GenericTextField } from "@/components/GenericTextField";
import { ProfileField } from "@/components/profile/ProfileField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { createProfileFieldErrorMap } from "@/lib/types/types";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const Template = () => {
  const mergedConfig = getMergedConfig();
  mergedConfig.profileDefaults.fields.dateOfFormation.default = {
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam gravida mattis magna et placerat. Aenean sagittis lectus neque, sed ultrices est fringilla eu. Vivamus non tellus ut dui auctor vehicula. Sed pellentesque nisi vel at blandit urna auctor ut.",
    errorTextRequired: "Error message will display here.",
    header: "Header Text",
    headerContextualInfo: "",
    headerNotBolded: "UnBoldedHeader Text",
  };
  const [config, setConfig] = useState<ConfigType>(mergedConfig);
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const { state: formContextState } = useFormContextHelper(createProfileFieldErrorMap());

  const fieldName = "dateOfFormation";
  return (
    <ProfileFormContext.Provider value={formContextState}>
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
          <h1>Using Profile Field Label Component</h1>
          <ProfileField fieldName={fieldName} isVisible={true}>
            <GenericTextField fieldName={fieldName} inputWidth={"full"} />
          </ProfileField>

          <ProfileField fieldName={fieldName} isVisible={true}>
            <GenericTextField fieldName={fieldName} inputWidth={"default"} />
          </ProfileField>

          <ProfileField fieldName={fieldName} isVisible={true}>
            <GenericTextField fieldName={fieldName} inputWidth={"reduced"} />
          </ProfileField>

          <WithErrorBar hasError type="ALWAYS">
            <ProfileField fieldName={fieldName} isVisible={true}>
              <GenericTextField
                fieldName={fieldName}
                inputWidth={"reduced"}
                required={true}
                error
                validationText={mergedConfig.profileDefaults.fields.dateOfFormation.default.errorTextRequired}
              />
            </ProfileField>
          </WithErrorBar>
        </ProfileDataContext.Provider>
      </ConfigContext.Provider>
    </ProfileFormContext.Provider>
  );
};

const meta: Meta<typeof Template> = {
  title: "Molecules/TextField/OneFieldTextField",
  component: Template,
  decorators: [(Story) => <div className="width-desktop">{Story()}</div>],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System?type=design&node-id=2759%3A6193&mode=design&t=pO4kgZ2SOAWLzINQ-1",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Template>;

export const OneFieldTextField: Story = {};
