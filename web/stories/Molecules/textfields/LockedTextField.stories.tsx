import { ExpandCollapseString } from "@/components/ExpandCollapseString";
import { GenericTextField } from "@/components/GenericTextField";
import { ProfileField } from "@/components/profile/ProfileField";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { generateProfileData } from "@businessnjgovnavigator/shared/index";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { useState } from "react";

export default {
  title: "Molecules/TextField/LockedTextField",
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
  mergedConfig.formation.fields.provisions.label = "Text Area Header";
  const [config, setConfig] = useState<ConfigType>(mergedConfig);

  const [profileData, setProfileData] = useState<ProfileData>(
    generateProfileData({ businessName: "displayed text" })
  );

  const text =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam gravida mattis magna et placerat.";
  const fieldName = "businessName";
  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <ProfileDataContext.Provider
        value={{
          state: {
            profileData: profileData,
            flow: "STARTING",
          },
          setProfileData,
          setUser: (): void => {},
          onBack: (): void => {},
        }}
      >
        <h1>Using Profile Field Label Component</h1>
        <ProfileField fieldName={fieldName} isVisible={true} locked>
          <GenericTextField fieldName={fieldName} inputWidth={"full"} />
        </ProfileField>

        <ReviewSubSection header={"Text Area Header"}>
          <ExpandCollapseString
            text={text + text + text + text + text + text + text}
            viewMoreText={config.formation.general.viewMoreButtonText}
            viewLessText={config.formation.general.viewLessButtonText}
            lines={2}
          />
        </ReviewSubSection>
      </ProfileDataContext.Provider>
    </ConfigContext.Provider>
  );
};

export const LockedTextField = Template.bind({});
LockedTextField.args = {};
