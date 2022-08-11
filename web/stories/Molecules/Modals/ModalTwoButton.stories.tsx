import { ModalTwoButton } from "@/components/ModalTwoButton";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import * as AlertStories from "../Alerts/DefaultAlert.stories";

export default {
  title: "Molecules/Modal/ModalTwoButton",
  component: ModalTwoButton,
  // decorators: [withDesign],
  // parameters: {
  //   design: {
  //     type: "figma",
  //     url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=1%3A1703",
  //   },
  // },
} as ComponentMeta<typeof ModalTwoButton>;

const Template: ComponentStory<typeof ModalTwoButton> = ({ ...args }) => <ModalTwoButton {...args} />;

export const Default = Template.bind({});
Default.args = {
  isOpen: true,
  title: "Title of Modal",
  close: () => {},
  children: "Children of Modal",
  primaryButtonText: "Button Text",
  secondaryButtonText: "Button Text",
};

export const ModalWithAlert = Template.bind({});
ModalWithAlert.args = {
  ...Default.args,
  showAlert: true,
  alertVariant: AlertStories.ErrorAlert.args?.variant,
  alertText: "Alert Text",
};
