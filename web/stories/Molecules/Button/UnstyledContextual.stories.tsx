import { ContextualInfoButton } from "@/components/ContextualInfoButton";
import { Meta, StoryObj } from "@storybook/react";

const Template = () => <ContextualInfoButton text="Contextual Link" id="id" />;

const meta: Meta<typeof Template> = {
  title: "Molecules/Button/Unstyled",
  component: Template,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2421%3A3127&t=k6Nkwsn3QXIhASwW-1",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Template>;

export const ContextualLink: Story = {};
