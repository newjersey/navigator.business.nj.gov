import { QuickActionTaskTile } from "@/components/dashboard/QuickActionTaskTile";
import { generateQuickActionTask } from "@/test/factories";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof QuickActionTaskTile> = {
  title: "Molecules/QuickAction",
  component: QuickActionTaskTile,
  decorators: [(Story) => <div className="width-desktop grid-row">{Story()}</div>],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System?type=design&node-id=4984%3A39153&mode=design&t=Or2X3NTXvhp1Rjjc-1",
    },
  },
};
export default meta;
type Story = StoryObj<typeof QuickActionTaskTile>;

export const QuickAction: Story = {
  args: {
    quickAction: generateQuickActionTask({ icon: "loop.svg", name: "Some Quick Action Text" }),
  },
};
