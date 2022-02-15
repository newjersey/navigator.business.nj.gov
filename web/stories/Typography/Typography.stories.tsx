import React from "react";
import { withDesign } from "storybook-addon-designs";

export default {
  title: "DesignSystem",
  decorators: [withDesign],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/EraDAUUvuOksWZtTgp2c9I/BFS-Design-System?node-id=1173%3A2209",
    },
  },
};

const usaProse = (
  <>
    <div className="margin-bottom-2">USA Prose</div>
    <div className="flex flex-row margin-bottom-5">
      <div className="border margin-right-2 display-inline-block usa-prose">
        <h1>H1 Header</h1>
      </div>
      <div className="border display-inline-block usa-prose h1-styling">
        <div>H1 Header with Styling</div>
      </div>
    </div>
    <div className="flex flex-row margin-bottom-5">
      <div className="border margin-right-2 display-inline-block usa-prose">
        <h2>H2 Header</h2>
      </div>
      <div className="border display-inline-block usa-prose h2-styling">
        <div>H2 Header with Styling</div>
      </div>
    </div>
    <div className="flex flex-row margin-bottom-5">
      <div className="border margin-right-2 display-inline-block usa-prose">
        <h3>H3 Header</h3>
      </div>
      <div className="border display-inline-block usa-prose h3-styling">
        <div>H3 Header with Styling</div>
      </div>
    </div>
    <div className="flex flex-row margin-bottom-5">
      <div className="border margin-right-2 display-inline-block usa-prose">
        <h4>H4 Header</h4>
      </div>
      <div className="border display-inline-block usa-prose h4-styling">
        <div>H4 Header with Styling</div>
      </div>
    </div>
    <div className="flex flex-row margin-bottom-5">
      <div className="border margin-right-2 display-inline-block usa-prose">
        <h5>H5 Header</h5>
      </div>
      <div className="border display-inline-block usa-prose h5-styling">
        <div>H5 Header with Styling</div>
      </div>
    </div>
    <div className="flex flex-row margin-bottom-5">
      <div className="border margin-right-2 display-inline-block usa-prose">
        <h6>H6 Header</h6>
      </div>
      <div className="border display-inline-block usa-prose h6-styling">
        <div>H6 Header with Styling</div>
      </div>
    </div>
    <div className="border margin-bottom-5 display-inline-block usa-prose">
      <div>standard text</div>
    </div>
  </>
);

const withoutUsaProse = (
  <>
    <div className="margin-bottom-2">Without USA Prose</div>
    <div className="flex flex-row margin-bottom-5">
      <div className="border margin-right-2 display-inline-block">
        <h1>H1 Header</h1>
      </div>
      <div className="border display-inline-block h1-styling">
        <div>H1 Header with Styling</div>
      </div>
    </div>
    <div className="flex flex-row margin-bottom-5">
      <div className="border margin-right-2 display-inline-block">
        <h2>H2 Header</h2>
      </div>
      <div className="border display-inline-block h2-styling">
        <div>H2 Header with Styling</div>
      </div>
    </div>
    <div className="flex flex-row margin-bottom-5">
      <div className="border margin-right-2 display-inline-block">
        <h3>H3 Header</h3>
      </div>
      <div className="border display-inline-block h3-styling">
        <div>H3 Header with Styling</div>
      </div>
    </div>
    <div className="flex flex-row margin-bottom-5">
      <div className="border margin-right-2 display-inline-block">
        <h4>H4 Header</h4>
      </div>
      <div className="border display-inline-block h4-styling">
        <div>H4 Header with Styling</div>
      </div>
    </div>
    <div className="flex flex-row margin-bottom-5">
      <div className="border margin-right-2 display-inline-block">
        <h5>H5 Header</h5>
      </div>
      <div className="border display-inline-block h5-styling">
        <div>H5 Header with Styling</div>
      </div>
    </div>
    <div className="flex flex-row margin-bottom-5">
      <div className="border margin-right-2 display-inline-block">
        <h6>H6 Header</h6>
      </div>
      <div className="border display-inline-block h6-styling">
        <div>H6 Header with Styling</div>
      </div>
    </div>
    <div className="border margin-bottom-5 display-inline-block">
      <div>standard text</div>
    </div>
  </>
);

const Template = ({}) => (
  <div className="flex flex-row">
    <div className="margin-right-5">{usaProse}</div>
    <div>{withoutUsaProse}</div>
  </div>
);

export const Typography = Template.bind({});
