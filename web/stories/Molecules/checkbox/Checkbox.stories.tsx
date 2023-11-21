import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { Meta, StoryObj } from "@storybook/react";

const Template = () => {
  return (
    <FormGroup>
      <FormControlLabel control={<Checkbox onChange={() => {}} />} label={"Unselected"} />
      <FormControlLabel control={<Checkbox checked={true} onChange={() => {}} />} label={"Selected"} />
      <FormControlLabel
        control={<Checkbox checked={false} color={"error"} onChange={() => {}} />}
        label={"Error"}
      />
      <FormControlLabel control={<Checkbox disabled onChange={() => {}} />} label={"Unselected Disabled"} />
      <FormControlLabel
        control={<Checkbox checked={true} disabled onChange={() => {}} />}
        label={"Selected Disabled"}
      />
    </FormGroup>
  );
};

const meta: Meta<typeof Template> = {
  title: "Molecules/Checkbox",
  component: Template,
  decorators: [(Story) => <div className="width-mobile">{Story()}</div>],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2854%3A6171&t=QO1bUJjZkHWR2jgl-1",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Template>;

export const DefaultCheckbox: Story = {};
