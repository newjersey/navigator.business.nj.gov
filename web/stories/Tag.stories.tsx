import { ComponentMeta, ComponentStory } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";
import { Tag } from "../src/components/njwds-extended/Tag";

export default {
  title: "Components",
  component: Tag,
  decorators: [withDesign],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=1%3A1469",
    },
  },
} as ComponentMeta<typeof Tag>;

const Template: ComponentStory<typeof Tag> = ({ children, ...args }) => (
  <div>
    <div>
      <div className="margin-bottom-2">
        Select <b>tagVariant</b> To View Different Variations
      </div>

      <div className="width-card-lg height-10 border margin-2 padding-1 border-gray-30">
        <Tag {...args}>No Styling Applied To This Tag</Tag>
      </div>
      <div className="width-card-lg height-10 border margin-2 padding-1 border-gray-30">
        <div className="flex flex-align-center">
          <Tag {...args}>Flex Box</Tag> <Tag {...args}>Flex Box</Tag>
        </div>
      </div>
    </div>

    <div>
      <div className="margin-bottom-2">With Props Applied</div>
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
      <div className="width-card-lg height-10 border margin-2 padding-1 border-gray-30">
        <Tag {...args} hover={true}>
          Hover styling applied
        </Tag>
      </div>
    </div>

    <div>
      <div>Only Use With Required Tag - Different Padding Applied</div>
      <div className="width-card-lg height-10 border margin-2 padding-1 border-gray-30">
        <div className="flex flex-align-center">
          <Tag {...args}>
            <img
              className="margin-right-05 margin-left-neg-1px margin-y-neg-1px"
              width="20px"
              height="20px"
              src="/img/required-task-icon.svg"
              alt=""
            />
            Flex Box
          </Tag>
        </div>
      </div>
    </div>
  </div>
);

export const TagComponent = Template.bind({});

TagComponent.args = {
  tagVariant: "baseDark",
};

TagComponent.parameters = { pseudo: { hover: true } };
