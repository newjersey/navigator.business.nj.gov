import { withDesign } from "storybook-addon-designs";

export default {
  title: "Atoms/DropShadows",
  decorators: [withDesign],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2966%3A8951",
    },
  },
};

const shadows = ["none", "xs", "xs-darker", "sm", "md", "lg", "xl"];
const renderColor = (variable: string) => (
  <div className="grid-row margin-y-6" key={variable}>
    <div className="h1-styling margin-right-4 width-card-xlg">Shadow ({variable})</div>
    <textarea
      className={`usa-textarea drop-shadow-${variable} margin-right-5`}
      id="input-type-textarea"
      name="input-type-textarea"
    ></textarea>
  </div>
);

const Template = ({}) => (
  <div className="grid-container">
    <div className="h1-styling-large margin-y-4">Drop Shadows</div>
    {shadows.map((shadow) => renderColor(shadow))}
  </div>
);

export const DropShadows = Template.bind({});
