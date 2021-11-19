import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";
import { Tag } from "../../src/components/njwds-extended/Tag";

export default {
  title: "Components/Tag/Info",
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

export const Info = Template.bind({});

Info.args = {
  tagVariant: "info",
  children: "info",
};

export const InfoBold = Template.bind({});
InfoBold.args = {
  tagVariant: "info",
  bold: true,
  children: "info",
};

export const InfoFixedWidth = Template.bind({});
InfoFixedWidth.args = {
  tagVariant: "info",
  fixedWidth: true,
  children: "info",
};

export const InfoHoverAndTextWrap = Template.bind({});
InfoHoverAndTextWrap.args = {
  tagVariant: "info",
  textWrap: true,
  hover: true,
  children:
    "This component is used within the annual filings calendar, reduce the browser width to see how it would look",
};
