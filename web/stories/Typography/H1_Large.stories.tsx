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
        <div>
          Sibling of Header - Div Element
          <div>Child Div of Div Element</div>
          <p>
            Child <strong>Paragraph Element</strong> of Div Element
          </p>
        </div>
        <div>sibling of Header Div Element</div>
        <p>
          Sibling of Header, paragraph element - Sed ut perspiciatis unde omnis iste natus error sit
          voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
          <strong>quae ab illo inventore veritatis et quasi architecto beatae vitae</strong>
          dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
          sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam
          est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius
        </p>
      </div>
    </div>
    <div>
      <div className="margin-bottom-2">Without USA Prose</div>
      <div className="margin-bottom-5 border">
        <div className="border display-inline-block h1-styling-large">H1 Large</div>
        <div>
          Sibling of Header - Div Element
          <div>Child Div of Div Element</div>
          <p>
            Child <strong>Paragraph Element</strong> of Div Element
          </p>
        </div>
        <div>sibling of Header Div Element</div>
        <p>
          Sibling of Header, paragraph element - Sed ut perspiciatis unde omnis iste natus error sit
          voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
          <strong>quae ab illo inventore veritatis et quasi architecto beatae vitae</strong>
          dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit,
          sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam
          est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius
        </p>
      </div>
    </div>
  </div>
);

const Template = ({}) => <>{h1Large}</>;

export const H1_Large = Template.bind({});
