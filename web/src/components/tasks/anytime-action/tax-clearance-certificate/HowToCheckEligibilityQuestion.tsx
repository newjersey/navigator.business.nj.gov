import { Heading } from "@/components/njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { TaxClearanceEligibilityOption } from "@businessnjgovnavigator/shared";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement } from "react";

interface Props {
  eligibilityOption: TaxClearanceEligibilityOption;
  setEligibilityOption: (option: TaxClearanceEligibilityOption) => void;
}

export const HowToCheckEligibilityQuestion = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const handleSelection = (event: React.ChangeEvent<{ name?: string; value: unknown }>): void => {
    props.setEligibilityOption(event.target.value as TaxClearanceEligibilityOption);
  };

  return (
    <div className="margin-bottom-2">
      <Heading level={4} styleVariant="h4" className="margin-bottom-05-override">
        {Config.taxClearanceCertificateStep2.checkEligibilityQuestion}
      </Heading>
      <FormControl fullWidth>
        <RadioGroup
          name="tax-clearance-eligibility-options"
          value={props.eligibilityOption}
          onChange={handleSelection}
        >
          <FormControlLabel
            style={{ alignItems: "center" }}
            labelPlacement="end"
            data-testid="tax-clearance-eligibility-address-option"
            value="TAX_ID"
            control={<Radio color="primary" />}
            label={Config.taxClearanceCertificateStep2.checkEligibilityTaxIdOption}
          />
          <FormControlLabel
            style={{ alignItems: "center" }}
            labelPlacement="end"
            data-testid="tax-clearance-eligibility-business-type-option"
            value="BUSINESS_TYPE"
            control={<Radio color="primary" />}
            label={Config.taxClearanceCertificateStep2.checkEligibilityBusinessTypeOption}
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
};
