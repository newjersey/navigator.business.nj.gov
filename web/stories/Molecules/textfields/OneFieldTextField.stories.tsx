import { GenericTextField } from "@/components/GenericTextField";
import { ProfileField } from "@/components/profile/ProfileField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { useState } from "react";

export default {
  title: "Molecules/TextField/OneFieldTextField",
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

  const fieldName = "dateOfFormation";
  return (
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
              validationText={mergedConfig.profileDefaults.fields.businessName.default.errorTextRequired}
            />
          </ProfileField>
        </WithErrorBar>
      </ProfileDataContext.Provider>
    </ConfigContext.Provider>
  );
};

export const OneFieldTextField = Template.bind({});
OneFieldTextField.args = {};
