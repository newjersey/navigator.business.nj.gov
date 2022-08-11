import { Tag } from "@/components/njwds-extended/Tag";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";

export default {
  title: "Molecules/Tag/IconWrappedInsideFlex",
  component: Tag,
  decorators: [withDesign],
  //   parameters: {
  //     design: {
  //       type: "figma",
  //       url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=1%3A1469",
  //     },
  //   },
} as ComponentMeta<typeof Tag>;

const Template: ComponentStory<typeof Tag> = ({ children, ...args }) => (
  <div className="flex flex-align-center">
    <Tag {...args}>{children}</Tag>
  </div>
);

export const RequiredTag = Template.bind({});
RequiredTag.args = {
  tagVariant: "required",
  children: (
    <>
      <img
        className="margin-right-05 margin-left-neg-1px margin-y-neg-1px"
        width="20px"
        height="20px"
        src="/img/required-task-icon.svg"
        alt=""
      />
      Content
    </>
  ),
};
