import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";

export default {
  title: "WIP/Alerts/Snackbars",
  component: SnackbarAlert,
  decorators: [withDesign],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=1%3A1703",
    },
  },
} as ComponentMeta<typeof SnackbarAlert>;

const Template: ComponentStory<typeof SnackbarAlert> = ({ ...args }) => <SnackbarAlert {...args} />;
const defaultArgs = { isOpen: true, heading: "Heading Content For Alert", children: "Alert Body Text" };

export const InfoSnackbar = Template.bind({});
InfoSnackbar.args = {
  ...defaultArgs,
  variant: "info",
};

export const WarningSnackbar = Template.bind({});
WarningSnackbar.args = {
  ...defaultArgs,
  variant: "warning",
};

export const ErrorSnackbar = Template.bind({});
ErrorSnackbar.args = {
  ...defaultArgs,
  variant: "error",
};

export const SuccessSnackbar = Template.bind({});
SuccessSnackbar.args = {
  ...defaultArgs,
  variant: "success",
};
