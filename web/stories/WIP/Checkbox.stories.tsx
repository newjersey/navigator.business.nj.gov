import { Checkbox, FormControlLabel, FormGroup, Radio } from "@mui/material";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "WIP/checkbox",
  component: Checkbox,
  decorators: [(Story) => <div className="width-mobile">{Story()}</div>],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2854%3A6171&t=QO1bUJjZkHWR2jgl-1",
    },
  },
} as ComponentMeta<typeof Checkbox>;

const DefaultCheckboxStory: ComponentStory<typeof Radio> = (args) => {
  return (
    <FormGroup>
      <FormControlLabel
        control={<Checkbox checked={false} onChange={() => {}} name="name-attribute" data-testid="testId" />}
        label={"Unselected"}
      />
      <FormControlLabel
        control={<Checkbox checked={true} onChange={() => {}} name="name-attribute" data-testid="testId" />}
        label={"Selected"}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={false}
            color={"error"}
            onChange={() => {}}
            name="name-attribute"
            data-testid="testId"
          />
        }
        label={"Error"}
      />
      <FormControlLabel
        control={<Checkbox disabled onChange={() => {}} name="name-attribute" data-testid="testId" />}
        label={"Unselected Disabled"}
      />
      <FormControlLabel
        control={
          <Checkbox checked={true} disabled onChange={() => {}} name="name-attribute" data-testid="testId" />
        }
        label={"Selected Disabled"}
      />
    </FormGroup>
  );
};
export const DefaultCheckbox = DefaultCheckboxStory.bind({});
