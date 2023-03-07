import { Checkbox, FormControlLabel, Radio } from "@mui/material";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";

export default {
  title: "WIP/checkbox",
  component: Checkbox,
  decorators: [withDesign],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2854%3A6171&t=QO1bUJjZkHWR2jgl-1",
    },
  },
} as ComponentMeta<typeof Checkbox>;

const renderCheckbox = () => (
  <FormControlLabel
    control={<Checkbox checked={false} onChange={() => {}} name="name-attribute" data-testid="testId" />}
    label={<div className=" ">{"Single Checkbox"}</div>}
  />
);
const SingleCheckboxStory: ComponentStory<typeof Radio> = (args) => {
  return renderCheckbox();
};
export const SingleCheckbox = SingleCheckboxStory.bind({});
