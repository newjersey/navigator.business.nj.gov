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
            sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro
            quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non
            numquam eius
          </p>
        </div>
        <div className="border display-inline-block usa-prose">
          <div className="h5-styling">H5 Div with Styling Class</div>
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
            sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro
            quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non
            numquam eius
          </p>
        </div>
      </div>
    </div>
    <div>
      <div className="margin-bottom-2">Without USA Prose</div>
      <div className="margin-bottom-5 border flex flex-row flex-align-start">
        <div className="border margin-right-2 display-inline-block">
          <h5>H5 Header</h5>
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
            sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro
            quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non
            numquam eius
          </p>
        </div>
        <div className="border display-inline-block">
          <div className="h5-styling">H5 Div with Styling Class</div>
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
            sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro
            quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non
            numquam eius
          </p>
        </div>
      </div>
    </div>
  </div>
);

const Template = ({}) => <>{h5Header}</>;

export const H5 = Template.bind({});
