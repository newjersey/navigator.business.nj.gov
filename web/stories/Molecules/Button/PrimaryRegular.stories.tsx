import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { Icon } from "@/components/njwds/Icon";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Molecules/Button/PrimaryRegular",
  component: PrimaryButton,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2421%3A3127&t=k6Nkwsn3QXIhASwW-1",
    },
  },
} as ComponentMeta<typeof PrimaryButton>;

const Template: ComponentStory<typeof PrimaryButton> = ({ children, ...args }) => (
  <PrimaryButton {...args}>{children}</PrimaryButton>
);

export const PrimaryColor = Template.bind({});

PrimaryColor.args = {
  isColor: "primary",
  children: "button",
};

export const IconRight = Template.bind({});

IconRight.args = {
  isColor: "primary",
  isReducedPaddingRight: true,
  children: (
    <>
      <>Button</>
      <Icon className="usa-icon--size-3 margin-left-05">arrow_drop_down</Icon>
    </>
  ),
};

export const AccentCoolerColor = Template.bind({});

AccentCoolerColor.args = {
  isColor: "accent-cooler",
  children: "button",
};

export const InfoColor = Template.bind({});

InfoColor.args = {
  isColor: "info",
  children: "button",
};
