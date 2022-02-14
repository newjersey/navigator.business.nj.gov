import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import { withDesign } from "storybook-addon-designs";
import { Alert } from "../../src/components/njwds-extended/Alert";

export default {
  title: "Components/Alert",
  component: Alert,
  decorators: [withDesign],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/EraDAUUvuOksWZtTgp2c9I/BFS-Design-System?node-id=1173%3A2209",
    },
  },
} as ComponentMeta<typeof Alert>;

const Template: ComponentStory<typeof Alert> = ({ children, ...args }) => (
  <div className="bg-base-lightest width-mobile height-mobile flex flex-align-center flex-justify-center">
    <Alert {...args}>{children}</Alert>
  </div>
);

export const Standard = Template.bind({});

Standard.args = {
  variant: "error",
  children: "Alert message",
};

export const NoIcon = Template.bind({});

NoIcon.args = {
  variant: "error",
  children: "Alert message",
  noIcon: true,
};

export const Heading = Template.bind({});

Heading.args = {
  variant: "error",
  children: "Alert message",
  heading: "H3 Heading",
};

export const Rounded = Template.bind({});

Rounded.args = {
  variant: "error",
  children: "Alert message",
  rounded: true,
};
