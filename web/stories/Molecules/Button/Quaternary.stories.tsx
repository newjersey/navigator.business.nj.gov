import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { Icon } from "@/components/njwds/Icon";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Molecules/Button/Quaternary",
  component: SecondaryButton,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2421%3A3127&t=k6Nkwsn3QXIhASwW-1",
    },
  },
} as ComponentMeta<typeof SecondaryButton>;

const Template: ComponentStory<typeof SecondaryButton> = ({ children, ...args }) => (
  <SecondaryButton {...args}>{children}</SecondaryButton>
);

export const LargeList = Template.bind({});

LargeList.args = {
  isColor: "border-base-light",
  size: "regular",
  children: (
    <>
      <Icon className="usa-icon--size-3 margin-right-05">list</Icon>
      <>List View</>
    </>
  ),
};

export const LargeGrid = Template.bind({});

LargeGrid.args = {
  isColor: "border-base-light",
  size: "regular",
  children: (
    <>
      <Icon className="usa-icon--size-3 margin-right-05">grid_view</Icon>
      <>Grid View</>
    </>
  ),
};

export const RegularShow = Template.bind({});

RegularShow.args = {
  size: "small",
  isColor: "border-base-light",
  children: (
    <>
      <Icon>visibility</Icon>
      <span className="margin-left-05 line-height-sans-2">List View</span>
    </>
  ),
};

export const RegularHide = Template.bind({});

RegularHide.args = {
  size: "small",
  isColor: "border-base-light",
  children: (
    <>
      <Icon>visibility_off</Icon>
      <span className="margin-left-05 line-height-sans-2">Hide</span>
    </>
  ),
};
