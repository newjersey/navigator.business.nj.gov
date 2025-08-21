import { FieldLabelOnboarding } from "@/components/field-labels/FieldLabelOnboarding";
import { GenericTextField } from "@/components/GenericTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import {
  ConfigContext,
  ConfigType,
  getMergedConfig,
} from "@businessnjgovnavigator/shared/contexts";
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
        <h1>Using Onboarding Field Label Component</h1>
        <FieldLabelOnboarding fieldName={fieldName} />
        <GenericTextField
          fieldName={fieldName}
          inputWidth={"reduced"}
          fieldOptions={{
            multiline: true,
            minRows: 3,
            maxRows: 20,
            className: "override-padding",
            inputProps: {
              maxLength: 500,
              sx: {
                padding: "1rem",
              },
            },
          }}
        />
        <div className="text-base-dark margin-top-1 margin-bottom-2">
          {10} / {500} {config.formation.general.charactersLabel}
        </div>

        <WithErrorBar hasError type="ALWAYS">
          <FieldLabelOnboarding fieldName={fieldName} />
          <GenericTextField
            fieldName={fieldName}
            inputWidth={"reduced"}
            fieldOptions={{
              multiline: true,
              minRows: 3,
              maxRows: 20,
              className: "override-padding",
              inputProps: {
                maxLength: 500,
                sx: {
                  padding: "1rem",
                },
              },
            }}
            error
            validationText={
              mergedConfig.profileDefaults.fields[fieldName].default.errorTextRequired
            }
          />
          <div className="text-base-dark margin-top-1 margin-bottom-2">
            {10} / {500} {config.formation.general.charactersLabel}
          </div>
        </WithErrorBar>
      </ProfileDataContext.Provider>
    </ConfigContext.Provider>
  );
};

const meta: Meta<typeof Template> = {
  title: "Molecules/TextField/TextArea",
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

export const TextArea: Story = {};
