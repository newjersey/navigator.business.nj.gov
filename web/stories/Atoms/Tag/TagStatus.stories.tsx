import { Tag } from "@/components/njwds-extended/Tag";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Tag> = {
  title: "Atoms/Tag/Status",
  component: Tag,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System?type=design&node-id=2895%3A6988&mode=design&t=yjn1vHzCSN7UAIMG-1",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

const defaultArgs = { children: "Tag Component Text" };

export const InProgress: Story = {
  args: {
    ...defaultArgs,
    backgroundColor: "accent-cool-lighter-lighttext",
  },
};

export const NotStarted: Story = {
  args: {
    ...defaultArgs,
    backgroundColor: "base-lighter",
  },
};

export const Completed: Story = {
  args: {
    ...defaultArgs,
    backgroundColor: "primary-lightest",
  },
};

export const CalendarTag: Story = {
  args: {
    ...defaultArgs,
    backgroundColor: "accent-warm-extra-light",
  },
};
