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

const h1Large = (
  <div className="flex flex-row">
    <div className="margin-right-2">
      <div className="margin-bottom-2">USA Prose</div>
      <div className="margin-bottom-5 border usa-prose">
        <div className="border display-inline-block h1-styling-large">H1 Large</div>
        <div>sibling div element</div>
        <div>sibling div element</div>
      </div>
    </div>
    <div>
      <div className="margin-bottom-2">Without USA Prose</div>
      <div className="margin-bottom-5 border">
        <div className="border display-inline-block h1-styling-large">H1 Large</div>
        <div>sibling div element</div>
        <div>sibling div element</div>
      </div>
    </div>
  </div>
);

const Template = ({}) => <>{h1Large}</>;

export const H1_Large = Template.bind({});
