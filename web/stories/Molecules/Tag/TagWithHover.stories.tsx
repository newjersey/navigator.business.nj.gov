import { Tag } from "@/components/njwds-extended/Tag";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";

export default {
  title: "Molecules/Tag/WithHover",
  component: Tag,
  decorators: [withDesign],
  //   parameters: {
  //     design: {
  //       type: "figma",
  //       url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=1%3A1469",
  //     },
  //   },
} as ComponentMeta<typeof Tag>;

const Template: ComponentStory<typeof Tag> = ({ children, ...args }) => <Tag {...args}>{children}</Tag>;

export const InfoTag = Template.bind({});
InfoTag.args = {
  tagVariant: "info",
  children: "Content",
  hover: true,
};

InfoTag.parameters = { pseudo: { hover: true } };
