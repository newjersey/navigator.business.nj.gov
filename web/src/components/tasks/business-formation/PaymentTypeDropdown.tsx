import { Content } from "@/components/Content";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { AllPaymentTypes } from "@/lib/types/types";
import { PaymentType } from "@businessnjgovnavigator/shared";
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import React, { ReactElement, useContext } from "react";
import { FormationContext } from "../BusinessFormation";

export const PaymentTypeDropdown = (): ReactElement => {
  const { state, setFormationFormData } = useContext(FormationContext);

  const handleChange = (event: SelectChangeEvent<string>) => {
    setFormationFormData({
      ...state.formationFormData,
      paymentType: event.target.value as PaymentType,
    });
  };

  const paymentOptions: AllPaymentTypes = [
    { type: "CC", displayText: BusinessFormationDefaults.creditCardPaymentTypeLabel },
    { type: "ACH", displayText: BusinessFormationDefaults.achPaymentTypeLabel },
  ];

  const selectedPaymentLabel = paymentOptions.find(
    (paymentType) => paymentType.type === state.formationFormData.paymentType
  )?.displayText;

  return (
    <>
      <Content>{state.displayContent.paymentType.contentMd}</Content>
      <div className="form-input margin-bottom-2">
        <FormControl fullWidth>
          <InputLabel id="payment-type-label" className="visibility-hidden">
            Payment Type
          </InputLabel>
          <Select
            labelId="payment-type-label"
            id="payment-type"
            displayEmpty
            value={state.formationFormData.paymentType || ""}
            onChange={handleChange}
            inputProps={{ "data-testid": "payment-type" }}
            renderValue={(selected) => {
              if (selected.length === 0) {
                return (
                  <div className="text-disabled-dark">{state.displayContent.paymentType.placeholder}</div>
                );
              }

              return selectedPaymentLabel;
            }}
          >
            {paymentOptions.map(({ type, displayText }) => (
              <MenuItem key={type} value={type} data-testid={type}>
                {displayText}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </>
  );
};
