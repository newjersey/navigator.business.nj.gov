import { Meta, StoryObj } from "@storybook/react";
import * as radioHelpers from "./radioHelpers";

const meta: Meta<typeof radioHelpers.renderRadioButton> = {
  title: "Molecules/Radio",
  component: radioHelpers.renderRadioButton,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2845%3A6061&t=jco1GPB7R1gpl8cH-1",
    },
  },
};

export default meta;
type Story = StoryObj<typeof radioHelpers.renderRadioButton>;

export const SingleRadio: Story = {
  args: {
    hasError: false,
  },
};

export const SingleRadioWithSelection: Story = {
  args: {
    hasError: false,
    selected: true,
  },
};

export const SingleRadioWithError: Story = {
  args: {
    hasError: true,
  },
};
