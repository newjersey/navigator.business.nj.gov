import { ButtonIcon } from "@/components/ButtonIcon";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Molecules/Button/Feedback",
  component: PrimaryButton,
  decorators: [(Story) => <div className="width-mobile">{Story()}</div>],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2421%3A3127&t=k6Nkwsn3QXIhASwW-1",
    },
  },
} as ComponentMeta<typeof PrimaryButton>;

const Template: ComponentStory<typeof PrimaryButton> = ({ children, ...args }) => (
  <PrimaryButton {...args}>{children}</PrimaryButton>
);

export const Regular = Template.bind({});

Regular.args = {
  children: (
    <>
      <ButtonIcon svgFilename="chat-processing" />
      <span className="text-left">Text Here</span>
    </>
  ),
  isColor: "accent-cool-lightest",
  isFullWidthOnDesktop: true,
  isTextAlignedLeft: true,
  isUnBolded: true,
};

export const Small = Template.bind({});

Small.args = {
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
};
