import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";
import { Tag } from "../components/njwds-extended/Tag";

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

export const Primary = Template.bind({});

Primary.args = {
  tagVariant: "primary",
  children: "primary",
};

export const Base = Template.bind({});
Base.args = {
  tagVariant: "base",
  children: "base",
};

export const Info = Template.bind({});
Info.args = {
  tagVariant: "info",
  children: "info",
};

export const Error = Template.bind({});
Error.args = {
  tagVariant: "error",
  children: "error",
};

export const Accent = Template.bind({});
Accent.args = {
  tagVariant: "accent",
  children: "accent",
};

export const noBg = Template.bind({});
noBg.args = {
  tagVariant: "noBg",
  children: "noBg Color",
};

export const baseDark = Template.bind({});
baseDark.args = {
  tagVariant: "baseDark",
  children: "base dark",
};
