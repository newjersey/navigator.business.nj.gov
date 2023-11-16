import { Tag } from "@/components/njwds-extended/Tag";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";

export default {
  title: "Atoms/Tag/Status",
  component: Tag,
  decorators: [withDesign],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System?type=design&node-id=2895%3A6988&mode=design&t=yjn1vHzCSN7UAIMG-1",
    },
  },
} as ComponentMeta<typeof Tag>;

const Template: ComponentStory<typeof Tag> = ({ children, ...args }) => <Tag {...args}>{children}</Tag>;
const defaultArgs = { children: "Tag Component Text" };

export const InProgress = Template.bind({});
InProgress.args = {
  ...defaultArgs,
  backgroundColor: "accent-cool-lighter",
};

export const NotStarted = Template.bind({});
NotStarted.args = {
  ...defaultArgs,
  backgroundColor: "base-lighter",
};

export const Completed = Template.bind({});
Completed.args = {
  ...defaultArgs,
  backgroundColor: "primary-lightest",
};

export const CalendarTag = Template.bind({});
CalendarTag.args = {
  ...defaultArgs,
  backgroundColor: "accent-warm-extra-light",
};
