import { Content } from "@/components/Content";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { WithErrorBar } from "@/components/WithErrorBar";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { withDesign } from "storybook-addon-designs";

export default {
  title: "Molecules/Radio",
  component: Radio,
  decorators: [withDesign],
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/vAa8neaM0JJSmldck5vlBC/BFS-Design-System-(Sprint-33%2B)?node-id=2845%3A6061&t=jco1GPB7R1gpl8cH-1",
    },
  },
} as ComponentMeta<typeof PrimaryButton>;

const longLabel =
  "Creating a label that wraps to over multiple lines, there is padding added around the label, the button is centered aligned";

const shortLabel = "short text option";
interface Obj {
  hasError: boolean;
  selected?: boolean;
  horizontal?: boolean;
  shortLabel?: boolean;
}
const renderFormControlLabel = (obj: Obj) => (
  <FormControlLabel
    aria-label="aria-label-attribute"
    style={{ alignItems: "center" }}
    labelPlacement="end"
    data-testid="data-test-id-attribute"
    value="Option-1"
    control={<Radio color={obj.hasError ? "error" : "primary"} />}
    label={
      <div className={`padding-y-1 ${obj.horizontal ? "margin-right-3" : ""}`}>
        {obj.shortLabel ? shortLabel : longLabel}
      </div>
    }
  />
);

const renderRadioButton = (obj: Obj) => (
  <WithErrorBar hasError={obj.hasError} type="ALWAYS">
    <Content>Header content goes here</Content>
    <FormControl fullWidth>
      <RadioGroup
        aria-label="aria-label-attribute"
        name="name-attribute"
        value={obj.selected ? "Option-1" : ""}
        onChange={() => {}}
      >
        {renderFormControlLabel(obj)}
      </RadioGroup>
    </FormControl>
    {obj.hasError && <div className="text-error-dark text-bold">Error Text</div>}
  </WithErrorBar>
);
const renderRadioButtonGroup = (obj: Obj) => (
  <WithErrorBar hasError={obj.hasError} type="ALWAYS">
    <Content>Header content goes here</Content>
    <FormControl fullWidth>
      <RadioGroup
        aria-label="aria-label-attribute"
        name="name-attribute"
        value={""}
        onChange={() => {}}
        row={obj.horizontal}
      >
        {renderFormControlLabel(obj)}
        {renderFormControlLabel(obj)}
        {renderFormControlLabel(obj)}
        {renderFormControlLabel(obj)}
      </RadioGroup>
    </FormControl>
    {obj.hasError && <div className="text-error-dark text-bold">Error Text</div>}
  </WithErrorBar>
);

const SingleRadio: ComponentStory<typeof Radio> = (args) => {
  return renderRadioButton({ hasError: false });
};
export const SingleRadioButton = SingleRadio.bind({});

const SingleRadioWithSelection: ComponentStory<typeof Radio> = (args) => {
  return renderRadioButton({ hasError: false, selected: true });
};
export const SingleRadioWithSelectionButton = SingleRadioWithSelection.bind({});

const SingleRadioWithError: ComponentStory<typeof Radio> = (args) => {
  return renderRadioButton({ hasError: true });
};
export const SingleRadioWithErrorButton = SingleRadioWithError.bind({});

const MultipleRadio: ComponentStory<typeof Radio> = () => renderRadioButtonGroup({ hasError: false });

export const MultipleRadioButton = MultipleRadio.bind({});

const MultipleRadioWithError: ComponentStory<typeof Radio> = () => renderRadioButtonGroup({ hasError: true });

export const MultipleRadioButtonWithError = MultipleRadioWithError.bind({});

const MultipleHorizontalRadio: ComponentStory<typeof Radio> = () =>
  renderRadioButtonGroup({ hasError: true, horizontal: true, shortLabel: true });

export const MultipleHorizontalRadioButton = MultipleHorizontalRadio.bind({});
