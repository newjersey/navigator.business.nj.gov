import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";
import { Button } from "../../src/components/njwds-extended/Button";

export default {
  title: "Components/Button/Secondary",
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

export const Secondary = Template.bind({});

Secondary.args = {
  style: "secondary",
  children: "button",
};

export const SecondaryWithNoMargins = Template.bind({});

SecondaryWithNoMargins.args = {
  style: "secondary",
  children: "button",
  noRightMargin: true,
};

export const SecondaryInputFieldHeight = Template.bind({});

SecondaryInputFieldHeight.args = {
  style: "secondary-input-field-height",
  children: "button",
};
