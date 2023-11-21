import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof UnStyledButton> = {
  title: "Molecules/Button/Unstyled",
  component: UnStyledButton,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2421%3A3127&t=k6Nkwsn3QXIhASwW-1",
    },
  },
};

export default meta;
type Story = StoryObj<typeof UnStyledButton>;

export const Link: Story = {
  args: {
    style: "default",
    children: "Link",
    isUnderline: true,
  },
};

export const MenuLink: Story = {
  args: {
    style: "default",
    children: "Menu Link",
    isUnderline: false,
  },
};

export const ArrowRightLink: Story = {
  args: {
    style: "default",
    children: (
      <>
        <span className="margin-right-2">Next Task</span>
        <Icon className="usa-icon--size-4">navigate_next</Icon>
      </>
    ),
    isUnderline: false,
  },
};

export const ArrowLeftLink: Story = {
  args: {
    style: "default",
    children: (
      <>
        <Icon className="usa-icon--size-4">navigate_before</Icon>
        <span className="margin-left-2">Previous Task</span>
      </>
    ),
    isUnderline: false,
  },
};

export const ArrowBackLink: Story = {
  args: {
    style: "default",
    children: (
      <>
        <div className="bg-accent-cool-darker circle-3 icon-blue-bg-color-hover">
          <Icon className="text-white usa-icon--size-3">arrow_back</Icon>
        </div>
        <div className="margin-left-2 margin-y-auto font-sans-xs text-accent-cool-darker underline">
          Go back
        </div>
      </>
    ),
    isUnderline: false,
    className: "fdr fac usa-link-hover-override",
  },
};

export const ExternalLink: Story = {
  args: {
    style: "default",
    children: (
      <>
        <>Link</>
        <Icon className="usa-icon--size-3 margin-left-05">launch</Icon>
      </>
    ),
    isUnderline: true,
  },
};
