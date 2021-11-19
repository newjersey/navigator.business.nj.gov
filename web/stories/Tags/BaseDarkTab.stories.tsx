import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";
import { Tag } from "../../src/components/njwds-extended/Tag";

export default {
  title: "Components/Tag/DarkBase",
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

export const DarkBase = Template.bind({});

DarkBase.args = {
  tagVariant: "baseDark",
  children: "darkBase",
};

export const DarkBaseBold = Template.bind({});
DarkBaseBold.args = {
  tagVariant: "baseDark",
  bold: true,
  children: "darkBase",
};

export const DarkBaseFixedWidth = Template.bind({});
DarkBaseFixedWidth.args = {
  tagVariant: "baseDark",
  fixedWidth: true,
  children: "darkBase",
};

export const DarkBaseTextWrap = Template.bind({});
DarkBaseTextWrap.args = {
  tagVariant: "baseDark",
  textWrap: true,
  children:
    "This component is used within the annual filings calendar, reduce the browser width to see how it would look",
};
