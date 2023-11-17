import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof SnackbarAlert> = {
  title: "WIP/Alerts/Snackbars",
  component: SnackbarAlert,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=1%3A1703",
    },
  },
};

export default meta;
type Story = StoryObj<typeof SnackbarAlert>;

const defaultArgs = {
  isOpen: true,
  heading: "Heading Content For Alert",
  children: "Alert Body Text",
  close: () => {},
};

export const InfoSnackbar: Story = {
  args: {
    ...defaultArgs,
    variant: "info",
  },
};

export const WarningSnackbar: Story = {
  args: {
    ...defaultArgs,
    variant: "warning",
  },
};

export const ErrorSnackbar: Story = {
  args: {
    ...defaultArgs,
    variant: "error",
  },
};

export const SuccessSnackbar: Story = {
  args: {
    ...defaultArgs,
    variant: "success",
  },
};
