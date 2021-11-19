import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";
import { Tag } from "../../src/components/njwds-extended/Tag";

export default {
  title: "Components/Tag/Base",
  component: Tag,
  decorators: [withDesign],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/EraDAUUvuOksWZtTgp2c9I/BFS-Design-System?node-id=1123%3A2193",
    },
  },
} as ComponentMeta<typeof Tag>;

const Template: ComponentStory<typeof Tag> = ({ children, ...args }) => <Tag {...args}>{children}</Tag>;

export const Base = Template.bind({});

Base.args = {
  tagVariant: "base",
  children: "base",
};

export const BaseBold = Template.bind({});
BaseBold.args = {
  tagVariant: "base",
  bold: true,
  children: "base",
};

export const BaseFixedWidth = Template.bind({});
BaseFixedWidth.args = {
  tagVariant: "base",
  fixedWidth: true,
  children: "base",
};

export const BaseTextWrap = Template.bind({});
BaseTextWrap.args = {
  tagVariant: "base",
  textWrap: true,
  children:
    "This component is used within the annual filings calendar, reduce the browser width to see how it would look",
};
