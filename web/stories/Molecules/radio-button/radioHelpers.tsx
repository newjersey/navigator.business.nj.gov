import { Content } from "@/components/Content";
import { WithErrorBar } from "@/components/WithErrorBar";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";

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
    label={obj.shortLabel ? shortLabel : longLabel}
  />
);
const renderRadioButton = (args: Obj) => {
  return (
    <WithErrorBar hasError={args.hasError} type="ALWAYS">
      <Content>Header content goes here</Content>
      <FormControl fullWidth>
        <RadioGroup
          aria-label="aria-label-attribute"
          name="name-attribute"
          value={args.selected ? "Option-1" : ""}
          onChange={() => {}}
        >
          {renderFormControlLabel(args)}
        </RadioGroup>
      </FormControl>
      {args.hasError && <div className="text-error-dark text-bold">Error Text</div>}
    </WithErrorBar>
  );
};

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

export { renderRadioButton, renderRadioButtonGroup };
