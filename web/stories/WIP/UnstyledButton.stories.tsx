import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";

export default {
  title: "WIP/UnStyledButton",
  component: UnStyledButton,
  decorators: [withDesign],
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

export const Standard = Template.bind({});

Standard.args = {
  style: "standard",
  children: "button",
};
