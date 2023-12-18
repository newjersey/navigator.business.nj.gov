import { ChecklistTag } from "@/components/ChecklistTag";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof ChecklistTag> = {
  title: "Atoms/Tag/ChecklistTag",
  component: ChecklistTag,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System?type=design&node-id=2895%3A6988&mode=design&t=yjn1vHzCSN7UAIMG-1",
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChecklistTag>;

export const Completed: Story = {
  args: {
    status: "ACTIVE",
  },
};

export const Pending: Story = {
  args: {
    status: "PENDING",
  },
};

export const Incomplete: Story = {
  args: {
    status: "INCOMPLETE",
  },
};

export const Scheduled: Story = {
  args: {
    status: "SCHEDULED",
  },
};

export const NotApplicable: Story = {
  args: {
    status: "NOT_APPLICABLE",
  },
};
