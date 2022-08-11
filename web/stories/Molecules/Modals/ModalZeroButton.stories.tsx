import { ComponentMeta, ComponentStory } from "@storybook/react";
import { ModalZeroButton } from "../../../src/components/ModalZeroButton";
import * as AlertStories from "../Alerts/DefaultAlert.stories";

export default {
  title: "Molecules/Modal/ModalZeroButton",
  component: ModalZeroButton,
  // decorators: [withDesign],
  // parameters: {
  //   design: {
  //     type: "figma",
  //     url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=1%3A1703",
  //   },
  // },
} as ComponentMeta<typeof ModalZeroButton>;

const Template: ComponentStory<typeof ModalZeroButton> = ({ ...args }) => <ModalZeroButton {...args} />;

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  title: "Title of Modal",
  close: () => {},
  children: "Children of Modal",
};

export const ModalWithAlert = Template.bind({});
ModalWithAlert.args = {
  ...Default.args,
  showAlert: true,
  alertVariant: AlertStories.ErrorAlert.args?.variant,
  alertText: "Alert Text",
};
