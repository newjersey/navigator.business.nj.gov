import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";
import { Button } from "../../src/components/njwds-extended/Button";

export default {
  title: "Components/Button/Primary",
  component: Button,
  decorators: [withDesign],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/EraDAUUvuOksWZtTgp2c9I/BFS-Design-System?node-id=1173%3A2209",
    },
  },
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = ({ children, ...args }) => (
  <Button {...args}>{children}</Button>
);

export const Primary = Template.bind({});

Primary.args = {
  style: "primary",
  children: "button",
};

export const PrimaryWithNoMargins = Template.bind({});

PrimaryWithNoMargins.args = {
  style: "primary",
  children: "button",
  noRightMargin: true,
};

export const PrimaryDisabled = Template.bind({});

PrimaryDisabled.args = {
  style: "primary",
  children: "button",
  disabled: true,
};
