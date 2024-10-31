import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { Icon } from "@/components/njwds/Icon";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof SecondaryButton> = {
  title: "Molecules/Button/Quaternary",
  component: SecondaryButton,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2421%3A3127&t=k6Nkwsn3QXIhASwW-1",
    },
  },
};

export default meta;
type Story = StoryObj<typeof SecondaryButton>;

export const LargeList: Story = {
  args: {
    isColor: "border-base-light",
    size: "regular",
    children: (
      <>
        <Icon className="usa-icon--size-3 margin-right-05" iconName="list" />
        <>List View</>
      </>
    ),
  },
};

export const LargeGrid: Story = {
  args: {
    isColor: "border-base-light",
    size: "regular",
    children: (
      <>
        <Icon className="usa-icon--size-3 margin-right-05" iconName="grid_view" />
        <>Grid View</>
      </>
    ),
  },
};

export const RegularShow: Story = {
  args: {
    size: "small",
    isColor: "border-base-light",
    children: (
      <>
        <Icon iconName="visibility" />
        <span className="margin-left-05 line-height-sans-2">List View</span>
      </>
    ),
  },
};

export const RegularHide: Story = {
  args: {
    size: "small",
    isColor: "border-base-light",
    children: (
      <>
        <Icon iconName="visibility_off" />
        <span className="margin-left-05 line-height-sans-2">Hide</span>
      </>
    ),
  },
};
