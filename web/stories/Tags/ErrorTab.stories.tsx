import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";
import { Tag } from "../../src/components/njwds-extended/Tag";

export default {
  title: "Components/Tag/Error",
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

export const Error = Template.bind({});

Error.args = {
  tagVariant: "error",
  children: "error",
};

export const ErrorBold = Template.bind({});
ErrorBold.args = {
  tagVariant: "error",
  bold: true,
  children: "error",
};

export const ErrorFixedWidth = Template.bind({});
ErrorFixedWidth.args = {
  tagVariant: "error",
  fixedWidth: true,
  children: "error",
};

export const ErrorBaseTextWrap = Template.bind({});
ErrorBaseTextWrap.args = {
  tagVariant: "error",
  textWrap: true,
  children:
    "This component is used within the annual filings calendar, reduce the browser width to see how it would look",
};
