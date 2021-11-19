import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";
import { Tag } from "../../src/components/njwds-extended/Tag";

export default {
  title: "Components/Tag/Accent",
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

export const Accent = Template.bind({});

Accent.args = {
  tagVariant: "accent",
  children: "accent",
};

export const AccentBold = Template.bind({});
AccentBold.args = {
  tagVariant: "accent",
  bold: true,
  children: "accent",
};

export const AccentFixedWidth = Template.bind({});
AccentFixedWidth.args = {
  tagVariant: "accent",
  fixedWidth: true,
  children: "accent",
};

export const AccentTextWrap = Template.bind({});
AccentTextWrap.args = {
  tagVariant: "accent",
  textWrap: true,
  children:
    "This component is used within the annual filings calendar, reduce the browser width to see how it would look",
};
