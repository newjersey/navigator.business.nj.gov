import { ExpandCollapseString } from "@/components/ExpandCollapseString";
import { GenericTextField } from "@/components/GenericTextField";
import { ProfileField } from "@/components/profile/ProfileField";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { createProfileFieldErrorMap } from "@/lib/types/types";
import { generateProfileData } from "@businessnjgovnavigator/shared";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const Template = () => {
  const mergedConfig = getMergedConfig();
  mergedConfig.formation.fields.additionalProvisions.label = "Text Area Header";
  const [config, setConfig] = useState<ConfigType>(mergedConfig);
  const [profileData, setProfileData] = useState<ProfileData>(
    generateProfileData({ businessName: "displayed text" })
  );
  const { state: formContextState } = useFormContextHelper(createProfileFieldErrorMap());

  const text =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam gravida mattis magna et placerat.";
  const fieldName = "businessName";
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
    </ProfileFormContext.Provider>
  );
};

const meta: Meta<typeof Template> = {
  title: "Molecules/TextField/LockedTextField",
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

export const LockedTextField: Story = {};
