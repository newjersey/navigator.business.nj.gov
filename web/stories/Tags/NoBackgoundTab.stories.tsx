import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";
import { Tag } from "../../src/components/njwds-extended/Tag";

export default {
  title: "Components/Tag/NoBackground",
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

export const NoBackground = Template.bind({});

NoBackground.args = {
  tagVariant: "noBg",
  children: "noBackground",
};

export const NoBackgroundBold = Template.bind({});
NoBackgroundBold.args = {
  tagVariant: "noBg",
  bold: true,
  children: "noBackground",
};

export const NoBackgroundFixedWidth = Template.bind({});
NoBackgroundFixedWidth.args = {
  tagVariant: "noBg",
  fixedWidth: true,
  children: "fixed width",
};

export const DarkBaseTextWrap = Template.bind({});
DarkBaseTextWrap.args = {
  tagVariant: "noBg",
  textWrap: true,
  children:
    "This component is used within the annual filings calendar, reduce the browser width to see how it would look",
};
