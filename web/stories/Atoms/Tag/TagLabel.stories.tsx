import { Tag } from "@/components/njwds-extended/Tag";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";

export default {
  title: "Atoms/Tag/Label",
  component: Tag,
  decorators: [withDesign],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System?type=design&node-id=2895%3A6988&mode=design&t=yjn1vHzCSN7UAIMG-1",
    },
  },
} as ComponentMeta<typeof Tag>;

const Template: ComponentStory<typeof Tag> = ({ children, ...args }) => <Tag {...args}>{children}</Tag>;
const defaultArgs = { children: "Tag Component Text" };

export const Certification = Template.bind({});
Certification.args = {
  ...defaultArgs,
  backgroundColor: "accent-cool-light",
};

export const TaxLabel = Template.bind({});
TaxLabel.args = {
  ...defaultArgs,
  backgroundColor: "accent-cooler-lightest",
};

export const Funding = Template.bind({});
Funding.args = {
  ...defaultArgs,
  backgroundColor: "accent-semi-cool-light",
};

export const DueDate = Template.bind({});
DueDate.args = {
  ...defaultArgs,
  backgroundColor: "white",
};
