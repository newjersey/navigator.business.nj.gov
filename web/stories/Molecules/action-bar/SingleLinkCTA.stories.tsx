import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { Meta, StoryObj } from "@storybook/react";

const Template = () => {
  return (
    <div className="width-card-lg tablet:width-tablet">
      <SingleCtaLink link="" text="text" />
    </div>
  );
};

const meta: Meta<typeof Template> = {
  title: "Molecules/ActionBar/SingleLinkCTA",
  component: Template,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System?type=design&node-id=3008%3A15652&mode=design&t=gfq3ZlK7jzjVpefb-1",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Template>;

export const SingleLinkCTA: Story = {};
