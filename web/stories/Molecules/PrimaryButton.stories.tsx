import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";

export default {
  title: "Molecules/PrimaryButton",
  component: PrimaryButton,
  decorators: [withDesign],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2421%3A3127&t=k6Nkwsn3QXIhASwW-1",
    },
  },
} as ComponentMeta<typeof PrimaryButton>;

const Template: ComponentStory<typeof PrimaryButton> = ({ children, ...args }) => (
  <div className="width-mobile">
    <PrimaryButton {...args}>{children}</PrimaryButton>
  </div>
);

export const PrimaryColor = Template.bind({});

PrimaryColor.args = {
  isColor: "primary",
  children: "button",
};

export const SecondaryColor = Template.bind({});

SecondaryColor.args = {
  isColor: "secondary",
  children: "button",
};

export const AccentCoolLightestColor = Template.bind({});

AccentCoolLightestColor.args = {
  isColor: "accent-cool-lightest",
  children: "button",
};

export const AccentCoolDarkerColor = Template.bind({});

AccentCoolDarkerColor.args = {
  isColor: "accent-cool-darker",
  children: "button",
};
