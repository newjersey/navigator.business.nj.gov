import { ModalOneButton } from "@/components/ModalOneButton";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import * as AlertStories from "../Alerts/DefaultAlert.stories";

export default {
  title: "Molecules/Modal/ModalOneButton",
  component: ModalOneButton,
  // decorators: [withDesign],
  // parameters: {
  //   design: {
  //     type: "figma",
  //     url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=1%3A1703",
  //   },
  // },
} as ComponentMeta<typeof ModalOneButton>;

const Template: ComponentStory<typeof ModalOneButton> = ({ ...args }) => <ModalOneButton {...args} />;

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  title: "Title of Modal",
  close: () => {},
  children: "Children of Modal",
  primaryButtonText: "Button Text",
};

export const ModalWithAlert = Template.bind({});
ModalWithAlert.args = {
  ...Default.args,
  showAlert: true,
  alertVariant: AlertStories.ErrorAlert.args?.variant,
  alertText: "Alert Text",
};
