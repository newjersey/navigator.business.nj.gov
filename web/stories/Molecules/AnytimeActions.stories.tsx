import { AnytimeActionDropdown } from "@/components/dashboard/AnytimeActionDropdown";
import {
  generateAnytimeActionLicenseReinstatement,
  generateAnytimeActionLink,
  generateAnytimeActionTask,
} from "@/test/factories";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof AnytimeActionDropdown> = {
  title: "Molecules/AnytimeAction",
  component: AnytimeActionDropdown,
  decorators: [(Story) => <div className="width-mobile">{Story()}</div>],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System?type=design&node-id=4984%3A39153&mode=design&t=Or2X3NTXvhp1Rjjc-1",
    },
  },
};
export default meta;
type Story = StoryObj<typeof AnytimeActionDropdown>;

export const AnytimeAction: Story = {
  args: {
    anytimeActionAdminTasks: [
      generateAnytimeActionTask({ icon: "loop.svg", name: "Some Anytime Action Text - Licenses Task" }),
    ],
    anytimeActionLicensesTasks: [
      generateAnytimeActionTask({ icon: "loop.svg", name: "Some Anytime Action Text - Admin Task" }),
    ],
    anytimeActionLinks: [
      generateAnytimeActionLink({ icon: "loop.svg", name: "Some Anytime Action Text - Link" }),
    ],
    anytimeActionLicenseReinstatements: [
      generateAnytimeActionLicenseReinstatement({
        icon: "loop.svg",
        name: "Some Anytime Action Text - License",
      }),
    ],
  },
};
