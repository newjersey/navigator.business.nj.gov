import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof SecondaryButton> = {
  title: "Molecules/Button/Secondary",
  component: SecondaryButton,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2421%3A3127&t=k6Nkwsn3QXIhASwW-1",
    },
  },
};

export default meta;
type Story = StoryObj<typeof SecondaryButton>;

export const PrimaryColor: Story = {
  args: {
    isColor: "primary",
    children: "button",
  },
};
