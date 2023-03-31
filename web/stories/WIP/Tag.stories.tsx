import { Tag } from "@/components/njwds-extended/Tag";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";

export default {
  title: "WIP/Tag",
  component: Tag,
  decorators: [withDesign],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=1%3A1469",
    },
  },
} as ComponentMeta<typeof Tag>;

const Template: ComponentStory<typeof Tag> = ({ children, ...args }) => <Tag {...args}>{children}</Tag>;
const defaultArgs = { children: "Tag Component Text" };

export const AccentCoolLight = Template.bind({});
AccentCoolLight.args = {
  ...defaultArgs,
  backgroundColor: "accent-cool-light",
};

export const AccentCoolLighter = Template.bind({});
AccentCoolLighter.args = {
  ...defaultArgs,
  backgroundColor: "accent-cool-lighter",
};

export const AccentCoolerLightest = Template.bind({});
AccentCoolerLightest.args = {
  ...defaultArgs,
  backgroundColor: "accent-cooler-lightest",
};

export const AccentWarnLighter = Template.bind({});
AccentWarnLighter.args = {
  ...defaultArgs,
  backgroundColor: "accent-warm-lighter",
};

export const BaseLighter = Template.bind({});
BaseLighter.args = {
  ...defaultArgs,
  backgroundColor: "base-lighter",
};

export const AccentWarmExtraLight = Template.bind({});
AccentWarmExtraLight.args = {
  ...defaultArgs,
  backgroundColor: "accent-warm-extra-light",
};

export const PrimaryLightest = Template.bind({});
PrimaryLightest.args = {
  ...defaultArgs,
  backgroundColor: "primary-lightest",
};

export const AccentSemiCoolLight = Template.bind({});
AccentSemiCoolLight.args = {
  ...defaultArgs,
  backgroundColor: "accent-semi-cool-light",
};

export const White = Template.bind({});
White.args = {
  ...defaultArgs,
  backgroundColor: "white",
};
