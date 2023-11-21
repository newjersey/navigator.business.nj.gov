import { Meta, StoryObj } from "@storybook/react";
import * as radioHelpers from "./radioHelpers";

const meta: Meta<typeof radioHelpers.renderRadioButtonGroup> = {
  title: "Molecules/Radio",
  component: radioHelpers.renderRadioButtonGroup,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2845%3A6061&t=jco1GPB7R1gpl8cH-1",
    },
  },
};

export default meta;
type Story = StoryObj<typeof radioHelpers.renderRadioButtonGroup>;

export const MultipleRadio: Story = {
  args: {
    hasError: false,
  },
};

export const MultipleRadioWithError: Story = {
  args: {
    hasError: true,
  },
};

export const MultipleHorizontalRadio: Story = {
  args: {
    hasError: true,
    horizontal: true,
    shortLabel: true,
  },
};
