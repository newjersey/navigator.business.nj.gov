import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import { ContextualInfoButton } from "@/components/ContextualInfoButton";
import { Icon } from "@/components/njwds/Icon";

export default {
  title: "Molecules/Button/Unstyled",
  component: UnStyledButton,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2421%3A3127&t=k6Nkwsn3QXIhASwW-1",
    },
  },
} as ComponentMeta<typeof UnStyledButton>;

const Template: ComponentStory<typeof UnStyledButton> = ({ children, ...args }) => (
  <UnStyledButton {...args}>{children}</UnStyledButton>
);

export const Link = Template.bind({});

Link.args = {
  style: "standard",
  children: "Link",
  isUnderline: true,
};

export const MenuLink = Template.bind({});

MenuLink.args = {
  style: "standard",
  children: "Menu Link",
  isUnderline: false,
};

export const ArrowRightLink = Template.bind({});

ArrowRightLink.args = {
  style: "standard",
  children: (
    <>
      <span className="margin-right-2">Next Task</span>
      <Icon className="usa-icon--size-4">navigate_next</Icon>
    </>
  ),
  isUnderline: false,
};

export const ArrowLeftLink = Template.bind({});

ArrowLeftLink.args = {
  style: "standard",
  children: (
    <>
      <Icon className="usa-icon--size-4">navigate_before</Icon>
      <span className="margin-left-2">Previous Task</span>
    </>
  ),
  isUnderline: false,
};

export const ArrowBackLink = Template.bind({});

ArrowBackLink.args = {
  style: "standard",
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
};

export const ExternalLink = Template.bind({});

ExternalLink.args = {
  style: "standard",
  children: (
    <>
      <>Link</>
      <Icon className="usa-icon--size-3 margin-left-05">launch</Icon>
    </>
  ),
  isUnderline: true,
};

const ContextualTemplate: ComponentStory<typeof ContextualInfoButton> = ({ ...args }) => (
  <ContextualInfoButton {...args} />
);

export const ContextualLink = ContextualTemplate.bind({});

ContextualLink.args = {
  text: "Contextual Link",
  id: "id",
};
