import React from "react";
import { withDesign } from "storybook-addon-designs";

export default {
  title: "DesignSystem/Typography",
  decorators: [withDesign],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/EraDAUUvuOksWZtTgp2c9I/BFS-Design-System?node-id=63%3A49",
    },
  },
};

const h1Header = (
  <div className="flex flex-row">
    <div className="margin-right-1">
      <div className="margin-bottom-2">USA Prose</div>
      <div className="margin-bottom-5 border flex flex-row flex-align-start">
        <div className="border margin-right-1 display-inline-block usa-prose">
          <h1>H1 Header</h1>
          <div>sibling div element</div>
          <div>sibling div element</div>
        </div>
        <div className="border display-inline-block usa-prose">
          <div className="h1-styling">H1 Div with Styling Class</div>
          <div>sibling div element</div>
          <div>sibling div element</div>
        </div>
      </div>
    </div>
    <div>
      <div className="margin-bottom-2">Without USA Prose</div>
      <div className="margin-bottom-5 border flex flex-row flex-align-start">
        <div className="border margin-right-1 display-inline-block">
          <h1>H1 Header</h1>
          <div>sibling div element</div>
          <div>sibling div element</div>
        </div>
        <div className="border display-inline-block">
          <div className="h1-styling">H1 Div with Styling Class</div>
          <div>sibling div element</div>
          <div>sibling div element</div>
        </div>
      </div>
    </div>
  </div>
);

const Template = ({}) => <>{h1Header}</>;

export const H1 = Template.bind({});
