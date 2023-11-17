import { Alert } from "@/components/njwds-extended/Alert";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Alert> = {
  title: "Molecules/Alerts",
  component: Alert,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=1%3A1703",
    },
  },
};
export default meta;
type Story = StoryObj<typeof Alert>;

const defaultArgs = {
  children: "Alert Body Text",
};

export const InfoAlert: Story = {
  args: {
    ...defaultArgs,
    variant: "info",
  },
};

export const WarningAlert: Story = {
  args: {
    ...defaultArgs,
    variant: "warning",
  },
};

export const ErrorAlert: Story = {
  args: {
    ...defaultArgs,
    variant: "error",
  },
};

export const SuccessAlert: Story = {
  args: {
    ...defaultArgs,
    variant: "success",
  },
};

export const NoteAlert: Story = {
  args: {
    ...defaultArgs,
    variant: "note",
  },
};
