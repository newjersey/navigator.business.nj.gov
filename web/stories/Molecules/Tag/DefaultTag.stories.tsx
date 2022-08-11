import { Tag } from "@/components/njwds-extended/Tag";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";

export default {
  title: "Molecules/Tag/Default",
  component: Tag,
  decorators: [withDesign, (story) => <div className="width-tablet">{story()}</div>],
  //   parameters: {
  //     design: {
  //       type: "figma",
  //       url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=1%3A1469",
  //     },
  //   },
} as ComponentMeta<typeof Tag>;

const Template: ComponentStory<typeof Tag> = ({ children, ...args }) => <Tag {...args}>{children}</Tag>;
export const PrimaryTag = Template.bind({});

PrimaryTag.args = {
  tagVariant: "primary",
  children: "Content",
};

export const BaseTag = Template.bind({});
BaseTag.args = {
  ...PrimaryTag.args,
  tagVariant: "base",
};

export const InfoTag = Template.bind({});
InfoTag.args = {
  ...PrimaryTag.args,
  tagVariant: "info",
};

export const ErrorTag = Template.bind({});
ErrorTag.args = {
  ...PrimaryTag.args,
  tagVariant: "error",
};

export const AccentTag = Template.bind({});
AccentTag.args = {
  ...PrimaryTag.args,
  tagVariant: "accent",
};

export const NoBgTag = Template.bind({});
NoBgTag.args = {
  ...PrimaryTag.args,
  tagVariant: "noBg",
};

export const BaseDarkTag = Template.bind({});
BaseDarkTag.args = {
  ...PrimaryTag.args,
  tagVariant: "baseDark",
};

export const BaseDarkestTag = Template.bind({});
BaseDarkestTag.args = {
  ...PrimaryTag.args,
  tagVariant: "baseDarkest",
};

export const CertificationTag = Template.bind({});
CertificationTag.args = {
  ...PrimaryTag.args,
  tagVariant: "certification",
};

export const FundingTag = Template.bind({});
FundingTag.args = {
  ...PrimaryTag.args,
  tagVariant: "funding",
};
