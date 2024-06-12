import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { FormationHelpButton } from "@/components/njwds-extended/FormationHelpButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { Meta, StoryObj } from "@storybook/react";

const Template = () => {
  return (
    <div className="width-card-lg tablet:width-tablet">
      <CtaContainer>
        <ActionBarLayout
          stackOnLeft={
            <div className="display-flex mobile-lg:display-block flex-justify-center">Float Left</div>
          }
        >
          <FormationHelpButton />
          <div className="margin-top-2 mobile-lg:margin-top-0">
            <SecondaryButton isColor="primary" onClick={() => {}}>
              SecondaryButton
            </SecondaryButton>
          </div>
          <PrimaryButton
            isColor="primary"
            onClick={() => {}}
            isRightMarginRemoved={true}
            dataTestId="next-button"
          >
            PrimaryButton
          </PrimaryButton>
        </ActionBarLayout>
      </CtaContainer>
    </div>
  );
};

const meta: Meta<typeof Template> = {
  title: "Molecules/ActionBar/MultiCTA",
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

export const MultiCTA: Story = {};
