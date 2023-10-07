import { Alert } from "@/components/njwds-extended/Alert";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";

export default {
  title: "Molecules/Alerts",
  component: Alert,
  decorators: [withDesign, (story) => <div className="border width-tablet">{story()}</div>],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=1%3A1703",
    },
  },
} as ComponentMeta<typeof Alert>;

const Template: ComponentStory<typeof Alert> = ({ ...args }) => <Alert {...args} />;
const defaultArgs = {
  children: "Alert Body Text",
};

export const InfoAlert = Template.bind({});
InfoAlert.args = {
  ...defaultArgs,
  variant: "info",
};

export const WarningAlert = Template.bind({});
WarningAlert.args = {
  ...defaultArgs,
  variant: "warning",
};

export const ErrorAlert = Template.bind({});
ErrorAlert.args = {
  ...defaultArgs,
  variant: "error",
};

export const SuccessAlert = Template.bind({});
SuccessAlert.args = {
  ...defaultArgs,
  variant: "success",
};

export const NoteAlert = Template.bind({});
NoteAlert.args = {
  ...defaultArgs,
  variant: "note",
  borderRight: true,
  borderSmall: true,
};
