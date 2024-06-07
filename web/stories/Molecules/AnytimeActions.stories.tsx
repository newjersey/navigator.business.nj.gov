import { AnytimeActionTile } from "@/components/dashboard/anytime-actions/AnytimeActionTile";
import { generateAnytimeActionTask } from "@/test/factories";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof AnytimeActionTile> = {
  title: "Molecules/AnytimeAction",
  component: AnytimeActionTile,
  decorators: [(Story) => <div className="width-mobile">{Story()}</div>],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System?type=design&node-id=4984%3A39153&mode=design&t=Or2X3NTXvhp1Rjjc-1",
    },
  },
};
export default meta;
type Story = StoryObj<typeof AnytimeActionTile>;

export const AnytimeAction: Story = {
  args: {
    type: "task",
    anytimeAction: generateAnytimeActionTask({ icon: "loop.svg", name: "Some Anytime Action Text" }),
  },
};
