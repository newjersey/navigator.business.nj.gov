import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import { withDesign } from "storybook-addon-designs";
import { Tag } from "../../src/components/njwds-extended/Tag";

export default {
  title: "Components/Tag",
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

export const Standard = Template.bind({});

Standard.args = {
  tagVariant: "info",
  children: "Tag Content",
};

export const Bold = Template.bind({});
Bold.args = {
  tagVariant: "info",
  bold: true,
  children: "Tag Content",
};

export const FixedWidth = Template.bind({});
FixedWidth.args = {
  tagVariant: "info",
  fixedWidth: true,
  children: "Tag Content",
};

export const Hover = Template.bind({});
Hover.args = {
  tagVariant: "info",
  hover: true,
  children: "Tag Content",
};

export const TextWrap = Template.bind({});
TextWrap.args = {
  tagVariant: "info",
  textWrap: true,
  children:
    "This component is used within the annual filings calendar, reduce the browser width to see how it would look",
};
