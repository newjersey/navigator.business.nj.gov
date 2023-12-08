import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ReverseOrderInMobile } from "@/components/ReverseOrderInMobile";
import { Meta, StoryObj } from "@storybook/react";

const Template = () => {
  return (
    <div className="tablet:display-flex flex-align-center">
      <div className="margin-bottom-2 tablet:margin-right-2 tablet:margin-bottom-0">
        Text outside of ReverseOrderInMobile component
      </div>
      <ReverseOrderInMobile>
        <>
          <SecondaryButton isColor="primary" dataTestId="modal-button-secondary" onClick={() => {}}>
            Secondary Button
          </SecondaryButton>
          <div className="margin-bottom-2 mobile-lg:margin-bottom-0">
            <PrimaryButton isColor="primary" isRightMarginRemoved={true} onClick={() => {}}>
              Primary Button
            </PrimaryButton>
          </div>
        </>
      </ReverseOrderInMobile>
      <div className="margin-top-2 tablet:margin-left-2 tablet:margin-top-0">
        Text outside of ReverseOrderInMobile component
      </div>
    </div>
  );
};

const meta: Meta<typeof Template> = {
  title: "Molecules/ActionBar",
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

export const ActionBar: Story = {};
