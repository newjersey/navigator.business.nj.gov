import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";
import { Button } from "../../src/components/njwds-extended/Button";

export default {
  title: "Components/Button/Tertiary",
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

export const Tertiary = Template.bind({});

Tertiary.args = {
  style: "tertiary",
  children: "button",
};

export const TertiaryBold = Template.bind({});

TertiaryBold.args = {
  style: "tertiary",
  children: "button",
  textBold: true,
};

export const TertiaryUnderline = Template.bind({});

TertiaryUnderline.args = {
  style: "tertiary",
  children: "button",
  underline: true,
};

export const TertiaryWithSmallText = Template.bind({});

TertiaryWithSmallText.args = {
  style: "tertiary",
  children: "button",
  smallText: true,
};
