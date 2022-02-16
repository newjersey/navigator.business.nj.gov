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

const h3Header = (
  <div className="flex flex-row">
    <div className="margin-right-2">
      <div className="margin-bottom-2">USA Prose</div>
      <div className="margin-bottom-5 border flex flex-row flex-align-start">
        <div className="border margin-right-2 display-inline-block usa-prose">
          <h3>H3 Header</h3>
          <div>sibling div element</div>
          <div>sibling div element</div>
        </div>
        <div className="border display-inline-block usa-prose">
          <div className="h3-styling">H3 Div with Styling Class</div>
          <div>sibling div element</div>
          <div>sibling div element</div>
        </div>
      </div>
    </div>
    <div>
      <div className="margin-bottom-2">Without USA Prose</div>
      <div className="margin-bottom-5 border flex flex-row flex-align-start">
        <div className="border margin-right-2 display-inline-block">
          <h3>H3 Header</h3>
          <div>sibling div element</div>
          <div>sibling div element</div>
        </div>
        <div className="border display-inline-block">
          <div className="h3-styling">H3 Div with Styling Class</div>
          <div>sibling div element</div>
          <div>sibling div element</div>
        </div>
      </div>
    </div>
  </div>
);

const Template = ({}) => <>{h3Header}</>;

export const H3 = Template.bind({});
