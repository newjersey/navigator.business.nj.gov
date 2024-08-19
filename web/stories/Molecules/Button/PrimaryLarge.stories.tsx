import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof PrimaryButton> = {
  title: "Molecules/Button/PrimaryLarge",
  component: PrimaryButton,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2421%3A3127&t=k6Nkwsn3QXIhASwW-1",
    },
  },
};
export default meta;
type Story = StoryObj<typeof PrimaryButton>;

export const PrimaryColor: Story = {
  args: {
    isColor: "primary",
    children: "button",
    isLargeButton: true,
  },
};

export const SecondaryColor: Story = {
  args: {
    isColor: "secondary",
    children: "button",
    isLargeButton: true,
  },
};

export const AccentCoolDarkerColor: Story = {
  args: {
    isColor: "accent-cool-darker",
    children: "button",
    isLargeButton: true,
  },
};

export const AccentCoolerColor: Story = {
  args: { isColor: "accent-cooler", children: "button", isLargeButton: true },
};

export const AccentSemiCoolColor: Story = {
  args: { isColor: "accent-semi-cool", children: "button", isLargeButton: true },
};
