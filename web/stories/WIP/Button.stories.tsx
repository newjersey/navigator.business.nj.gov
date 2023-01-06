import { ComponentMeta, ComponentStory } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";
import { Button } from "../../src/components/njwds-extended/Button";

export default {
  title: "WIP/Button",
  component: Button,
  decorators: [withDesign],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/EraDAUUvuOksWZtTgp2c9I/BFS-Design-System?node-id=1173%3A2209",
    },
  },
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = ({ children, ...args }) => (
  <Button {...args}>{children}</Button>
);

export const Standard = Template.bind({});

Standard.args = {
  style: "primary",
  children: "button",
};

export const NoMargins = Template.bind({});

NoMargins.args = {
  style: "primary",
  children: "button",
  noRightMargin: true,
};
