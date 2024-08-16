import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { Icon } from "@/components/njwds/Icon";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof PrimaryButton> = {
  title: "Molecules/Button/PrimaryRegular",
  component: PrimaryButton,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2421%3A3127&t=k6Nkwsn3QXIhASwW-1",
    },
  },
};

export default meta;
type Story = StoryObj<typeof PrimaryButton>;

export const PrimaryColor: Story = {
  args: {
    isColor: "primary",
    children: "button",
  },
};

export const PrimaryWhiteColor: Story = {
  args: {
    isColor: "white",
    children: "button",
  },
};

export const IconRight: Story = {
  args: {
    isColor: "primary",
    children: (
      <>
        <>Button</>
        <Icon className="usa-icon--size-3 margin-left-05">arrow_drop_down</Icon>
      </>
    ),
  },
};

export const AccentCoolerColor: Story = {
  args: {
    isColor: "accent-cooler",
    children: "button",
  },
};

export const AccentSemiCoolColor: Story = {
  args: {
    isColor: "accent-semi-cool",
    children: "button",
  },
};
