import { QuickActionTile } from "@/components/dashboard/quick-actions/QuickActionTile";
import { generateQuickActionTask } from "@/test/factories";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof QuickActionTile> = {
  title: "Molecules/QuickAction",
  component: QuickActionTile,
  decorators: [(Story) => <div className="width-mobile">{Story()}</div>],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System?type=design&node-id=4984%3A39153&mode=design&t=Or2X3NTXvhp1Rjjc-1",
    },
  },
};
export default meta;
type Story = StoryObj<typeof QuickActionTile>;

export const QuickAction: Story = {
  args: {
    type: "task",
    quickAction: generateQuickActionTask({ icon: "loop.svg", name: "Some Quick Action Text" }),
  },
};
