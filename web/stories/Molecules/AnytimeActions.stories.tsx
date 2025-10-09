import { AnytimeActionSearch } from "@/components/dashboard/AnytimeActionSearch";
import {
  generateAnytimeActionLicenseReinstatement,
  generateAnytimeActionTask,
} from "@/test/factories";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof AnytimeActionSearch> = {
  title: "Molecules/AnytimeAction",
  component: AnytimeActionSearch,
  decorators: [(Story) => <div className="width-mobile">{Story()}</div>],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System?type=design&node-id=4984%3A39153&mode=design&t=Or2X3NTXvhp1Rjjc-1",
    },
  },
};
export default meta;
type Story = StoryObj<typeof AnytimeActionSearch>;

export const AnytimeAction: Story = {
  args: {
    anytimeActionTasks: [
      generateAnytimeActionTask({ name: "Some Anytime Action Text - Licenses Task" }),
    ],
    anytimeActionLicenseReinstatements: [
      generateAnytimeActionLicenseReinstatement({
        name: "Some Anytime Action Text - License",
      }),
    ],
  },
};
