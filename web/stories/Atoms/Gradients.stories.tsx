import { Heading } from "@/components/njwds-extended/Heading";
import { Meta, StoryObj } from "@storybook/react";

const Template = () => {
  const renderGradient = (gradientName: string) => (
    <div className="margin-right-1">
      <div
        className={`margin-bottom-2 height-10 width-15rem ${gradientName} text-base-darkest text-bold margin-right-6`}
      />
      <div>{gradientName}</div>
    </div>
  );

  const PrimaryGradient = (
    <div className="flex flex-row margin-bottom-2">
      {renderGradient("primary-gradient")}
      {renderGradient("primary-gradient-reverse")}
    </div>
  );

  const SecondaryGradient = (
    <div className="flex flex-row margin-bottom-2">
      {renderGradient("secondary-gradient")}
      {renderGradient("secondary-gradient-reverse")}
    </div>
  );

  const TertiaryGradient = (
    <div className="flex flex-row margin-bottom-2">
      {renderGradient("tertiary-gradient")}
      {renderGradient("tertiary-gradient-reverse")}
    </div>
  );

  return (
    <div>
      <Heading level={2} styleVariant="h1Large" className="margin-y-4">
        Primary Gradient
      </Heading>
      <div className="margin-y-2">
        <div>{PrimaryGradient}</div>
      </div>
      <Heading level={2} styleVariant="h1Large" className="margin-y-4">
        Secondary Gradient
      </Heading>
      <div className="margin-y-2">
        <div>{SecondaryGradient}</div>
      </div>
      <Heading level={2} styleVariant="h1Large" className="margin-y-4">
        Tertiary Gradient
      </Heading>
      <div className="margin-y-2">
        <div>{TertiaryGradient}</div>
      </div>
    </div>
  );
};

const meta: Meta<typeof Template> = {
  title: "Atoms/Gradients",
  component: Template,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=1933%3A2730",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Template>;

export const Gradients: Story = {};
