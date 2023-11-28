import { Heading } from "@/components/njwds-extended/Heading";
import { Meta, StoryObj } from "@storybook/react";

const Template = () => {
  const shadows = ["none", "xs", "xs-darker", "sm", "md", "lg", "xl"];
  const renderColor = (variable: string) => (
    <div className="bg-white width-mobile-lg height-mobile-lg ">
      <div className="grid-row margin-y-6" key={variable}>
        <Heading level={2} styleVariant="h1">
          Shadow ({variable})
        </Heading>
        <div
          className={`drop-shadow-${variable} margin-left-5 width-mobile height-15 bg-success-extra-light`}
        />
      </div>
    </div>
  );

  return (
    <div className="grid-container">
      <Heading level={1} styleVariant="h1Large" className="margin-y-4">
        Drop Shadows
      </Heading>
      {shadows.map((shadow) => renderColor(shadow))}
    </div>
  );
};

const meta: Meta<typeof Template> = {
  title: "Atoms/DropShadows",
  component: Template,
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2966%3A8951",
    },
  },
};
export default meta;
type Story = StoryObj<typeof Template>;

export const DropShadows: Story = {};
