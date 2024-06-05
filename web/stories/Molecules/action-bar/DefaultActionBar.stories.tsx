import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { Meta, StoryObj } from "@storybook/react";

const Template = () => {
  return (
    <div className="tablet:width-tablet">
      <hr className="margin-bottom-2" />
      <ActionBarLayout>
        <div className="margin-top-2 mobile-lg:margin-top-0">
          <SecondaryButton isColor="primary" onClick={() => {}} dataTestId="back">
            SecondaryButton
          </SecondaryButton>
        </div>
        <div className="mobile-lg:display-inline">
          <PrimaryButton
            isColor="primary"
            dataTestId="next"
            isSubmitButton={true}
            isRightMarginRemoved={true}
          >
            PrimaryButton
          </PrimaryButton>
        </div>
      </ActionBarLayout>
    </div>
  );
};

const meta: Meta<typeof Template> = {
  title: "Molecules/ActionBar/Default",
  component: Template,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System?type=design&node-id=3008%3A15652&mode=design&t=gfq3ZlK7jzjVpefb-1",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Template>;

export const Default: Story = {};
