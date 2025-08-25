import { TaxId } from "@/components/data-fields/tax-id/TaxId";
import { FieldLabelModal } from "@/components/field-labels/FieldLabelModal";
import { WithErrorBar } from "@/components/WithErrorBar";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { generateProfileData } from "@businessnjgovnavigator/shared";
import {
  ConfigContext,
  ConfigType,
  getMergedConfig,
} from "@businessnjgovnavigator/shared/contexts";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
const Template = () => {
  const taxId = "2";
  const [config, setConfig] = useState<ConfigType>(getMergedConfig());
  const [profileData, setProfileData] = useState<ProfileData>(generateProfileData({ taxId }));
  const { state: formContextState } = useFormContextHelper(createDataFormErrorMap());

  return (
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
            <TaxId
              dbBusinessTaxId={taxId}
              validationText={config.taxAccess.failedTaxIdHelper}
              required
            />

            <WithErrorBar hasError type="ALWAYS" className="margin-top-2">
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
              <TaxId
                dbBusinessTaxId={taxId}
                validationText={config.taxAccess.failedTaxIdHelper}
                required
                error
              />
            </WithErrorBar>
          </ProfileDataContext.Provider>
        </ConfigContext.Provider>
      </NeedsAccountContext.Provider>
    </DataFormErrorMapContext.Provider>
  );
};

const meta: Meta<typeof Template> = {
  title: "Molecules/TextField/TwoEncryptedTextField",
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

export const TwoEncryptedTextField: Story = {};
