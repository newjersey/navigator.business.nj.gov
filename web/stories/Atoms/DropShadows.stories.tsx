import { Heading } from "@/components/njwds-extended/Heading";
import { Meta, StoryObj } from "@storybook/react";

const Template = () => {
  const shadows = ["xs", "xs-darker", "sm", "md", "lg", "xl"];
  const renderColor = (variable: string) => (
    <div className="bg-white width-mobile-lg height-mobile-lg ">
      <div className="margin-y-6" key={variable}>
        <Heading level={2} styleVariant="h1">
          Shadow {variable}
        </Heading>
        <div className="display-flex flex-column">
          <div>Reg</div>
          <div className={`drop-shadow-${variable} width-mobile height-10`} />
        </div>
        <div className="display-flex flex-column margin-top-2">
          <div>On Hover</div>
          <div className={`drop-shadow-${variable}-on-hover width-mobile height-10 bg-base-lightest`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid-container">
      <Heading level={1} styleVariant="h1Large" className="margin-y-4">
        Drop Shadows
      </Heading>
      <div className="bg-white width-mobile-lg height-mobile-lg">
        <div className="grid-row margin-y-6">
          <Heading level={2} styleVariant="h1">
            Shadow None
          </Heading>
          <div className="width-mobile height-10 border-base-light border-1px" />
        </div>
      </div>
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
