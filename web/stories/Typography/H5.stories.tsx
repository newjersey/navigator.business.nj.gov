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

const h5Header = (
  <div className="flex flex-row">
    <div className="margin-right-2">
      <div className="margin-bottom-2">USA Prose</div>
      <div className="margin-bottom-5 border flex flex-row flex-align-start">
        <div className="border margin-right-2 display-inline-block usa-prose">
          <h5>H5 Header</h5>
          <div>sibling div element</div>
          <div>sibling div element</div>
        </div>
        <div className="border display-inline-block usa-prose">
          <div className="h5-styling">H5 Div with Styling Class</div>
          <div>sibling div element</div>
          <div>sibling div element</div>
        </div>
      </div>
    </div>
    <div>
      <div className="margin-bottom-2">Without USA Prose</div>
      <div className="margin-bottom-5 border flex flex-row flex-align-start">
        <div className="border margin-right-2 display-inline-block">
          <h5>H5 Header</h5>
          <div>sibling div element</div>
          <div>sibling div element</div>
        </div>
        <div className="border display-inline-block">
          <div className="h5-styling">H5 Div with Styling Class</div>
          <div>sibling div element</div>
          <div>sibling div element</div>
        </div>
      </div>
    </div>
  </div>
);

const Template = ({}) => <>{h5Header}</>;

export const H5 = Template.bind({});
