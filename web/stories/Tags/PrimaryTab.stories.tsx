import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";
import { Tag } from "../../src/components/njwds-extended/Tag";

export default {
  title: "Components/Tag/Primary",
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

export const Primary = Template.bind({});

Primary.args = {
  tagVariant: "primary",
  children: "primary",
};

export const PrimaryBold = Template.bind({});
PrimaryBold.args = {
  tagVariant: "primary",
  bold: true,
  children: "primary",
};

export const PrimaryFixedWidth = Template.bind({});
PrimaryFixedWidth.args = {
  tagVariant: "primary",
  fixedWidth: true,
  children: "primary",
};

export const PrimaryTextWrap = Template.bind({});
PrimaryTextWrap.args = {
  tagVariant: "primary",
  textWrap: true,
  children:
    "This component is used within the annual filings calendar, reduce the browser width to see how it would look",
};
