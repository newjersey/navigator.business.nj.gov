import { ComponentMeta, ComponentStory } from "@storybook/react";
import React from "react";
import { withDesign } from "storybook-addon-designs";
import { Tag } from "../../src/components/njwds-extended/Tag";

export default {
  title: "Components/Tag",
  component: Tag,
  decorators: [withDesign],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/EraDAUUvuOksWZtTgp2c9I/BFS-Design-System?node-id=1123%3A2193",
    },
  },
} as ComponentMeta<typeof Tag>;

const Template: ComponentStory<typeof Tag> = ({ children, ...args }) => (
  <div>
    <div>
      <div>Tag Component - Select tagVariant To View Different Variations</div>
      <div className="width-card-lg height-10 border margin-2 padding-1 border-gray-30">
        <Tag {...args}>No Styling Applied To This Tag</Tag>
      </div>
      <div className="width-card-lg height-10 border margin-2 padding-1 border-gray-30">
        <Tag {...args} bold={true}>
          Bolded
        </Tag>
      </div>
      <div className="width-card-lg height-10 border margin-2 padding-1 border-gray-30">
        <Tag {...args} textWrap={true}>
          Text Wrap Applied To This Tag
        </Tag>
      </div>
      <div className="width-card-lg height-10 border margin-2 padding-1 border-gray-30">
        <Tag {...args} fixedWidth={true}>
          Fixed Width
        </Tag>
      </div>
    </div>
    <div>
      <div>Hover State</div>
      <div className="width-card-lg height-10 border margin-2 padding-1 border-gray-30">
        <Tag {...args} hover={true}>
          Hover styling applied
        </Tag>
      </div>
    </div>
  </div>
);

export const Standard = Template.bind({});

Standard.args = {
  tagVariant: "info",
};

Standard.parameters = { pseudo: { hover: true } };
