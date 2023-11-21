import { ButtonIcon } from "@/components/ButtonIcon";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof PrimaryButton> = {
  title: "Molecules/Button/Feedback",
  component: PrimaryButton,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2421%3A3127&t=k6Nkwsn3QXIhASwW-1",
    },
  },
};

export default meta;
type Story = StoryObj<typeof PrimaryButton>;

export const Small: Story = {
  args: {
    isColor: "secondary",
    isUnBolded: true,
    isSmallerText: true,
    isNotFullWidthOnMobile: true,
    children: (
      <>
        <ButtonIcon svgFilename="lightbulb-on-warning-light" sizePx="16px" />
        <span className="text-left">Text Here</span>
      </>
    ),
    isVerticalPaddingRemoved: true,
  },
};
