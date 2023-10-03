import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Molecules/Button/PrimaryLarge",
  component: PrimaryButton,
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

export const PrimaryColor = Template.bind({});

PrimaryColor.args = {
  isColor: "primary",
  children: "button",
  isLargeButton: true,
};

export const SecondaryColor = Template.bind({});

SecondaryColor.args = {
  isColor: "secondary",
  children: "button",
  isLargeButton: true,
};

export const AccentCoolDarkerColor = Template.bind({});

AccentCoolDarkerColor.args = {
  isColor: "accent-cool-darker",
  children: "button",
  isLargeButton: true,
};

export const AccentCoolerColor = Template.bind({});

AccentCoolerColor.args = {
  isColor: "accent-cooler",
  children: "button",
  isLargeButton: true,
};

export const InfoColor = Template.bind({});

InfoColor.args = {
  isColor: "info",
  children: "button",
  isLargeButton: true,
};
