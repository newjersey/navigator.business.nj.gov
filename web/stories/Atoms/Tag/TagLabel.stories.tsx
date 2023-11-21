import { Tag } from "@/components/njwds-extended/Tag";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Tag> = {
  title: "Atoms/Tag/Label",
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

export const Certification: Story = {
  args: {
    ...defaultArgs,
    backgroundColor: "accent-cool-light",
  },
};

export const TaxLabel: Story = {
  args: {
    ...defaultArgs,
    backgroundColor: "accent-cooler-lightest",
  },
};

export const Funding: Story = {
  args: {
    ...defaultArgs,
    backgroundColor: "accent-semi-cool-light",
  },
};

export const DueDate: Story = {
  args: {
    ...defaultArgs,
    backgroundColor: "white",
  },
};
