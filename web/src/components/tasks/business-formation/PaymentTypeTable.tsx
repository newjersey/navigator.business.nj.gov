import { Content } from "@/components/Content";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { getDollarValue } from "@/lib/utils/helpers";
import { PaymentType } from "@businessnjgovnavigator/shared";
import { FormHelperText, Radio } from "@mui/material";
import React, { ReactElement, useContext, useEffect, useState } from "react";
import { FormationContext } from "../BusinessFormation";

export const PaymentTypeTable = (): ReactElement => {
  const { state, setFormationFormData, setErrorMap } = useContext(FormationContext);
  const [totalCost, setTotalCost] = useState<number>(0);

  useEffect(() => {
    let minCost = state.displayContent.officialFormationDocument.cost;
    if (state.formationFormData.certificateOfStanding) {
      minCost += state.displayContent.certificateOfStanding.cost;
    }
    if (state.formationFormData.certifiedCopyOfFormationDocument) {
      minCost += state.displayContent.certifiedCopyOfFormationDocument.cost;
    }
    if (state.formationFormData.paymentType === "ACH") {
      minCost += parseFloat(BusinessFormationDefaults.achPaymentCost);
    }
    if (state.formationFormData.paymentType === "CC") {
      minCost += parseFloat(BusinessFormationDefaults.creditCardPaymentCost);
    }
    setTotalCost(minCost);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.formationFormData.certificateOfStanding,
    state.formationFormData.paymentType,
    state.formationFormData.certifiedCopyOfFormationDocument,
  ]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMap({ ...state.errorMap, paymentType: { invalid: false } });
    setFormationFormData({
      ...state.formationFormData,
      paymentType: event.target.value as PaymentType,
    });
  };

  return (
    <>
      <table className="business-formation-table business-formation-payment">
        <thead>
          <tr>
            <th className="text-bold">{BusinessFormationDefaults.paymentTypeTableLabel}</th>
            <th></th>
            <th></th>
          </tr>
          <tr>
            <th colSpan={3}>
              {state.errorMap.paymentType.invalid ? (
                <FormHelperText className={"text-error"}>
                  {BusinessFormationDefaults.paymentTypeErrorText}
                </FormHelperText>
              ) : (
                " "
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div className="business-formation-table-checkboxes">
                <Radio
                  id="paymentTypeCreditCardRadio"
                  className={state.errorMap.paymentType.invalid ? "text-error" : ""}
                  checked={state.formationFormData.paymentType === "CC"}
                  onChange={handleChange}
                  inputProps={{
                    "aria-label": "Credit card",
                  }}
                  value="CC"
                  name="radio-buttons"
                />
              </div>
            </td>
            <td>
              <label
                htmlFor="creditCardRadio"
                className={
                  state.errorMap.paymentType.invalid
                    ? "text-error"
                    : state.formationFormData.paymentType === "CC"
                    ? "text-success-dark text-bold"
                    : ""
                }
              >
                <Content>{BusinessFormationDefaults.creditCardPaymentTypeLabel}</Content>
              </label>
            </td>
            <td className={state.formationFormData.paymentType === "CC" ? "text-success-dark text-bold" : ""}>
              {getDollarValue(BusinessFormationDefaults.creditCardPaymentCost)}
            </td>
          </tr>
          <tr>
            <td>
              <div className="business-formation-table-checkboxes">
                <Radio
                  id="paymentTypeACHRadio"
                  className={state.errorMap.paymentType.invalid ? "text-error" : ""}
                  checked={state.formationFormData.paymentType === "ACH"}
                  onChange={handleChange}
                  value="ACH"
                  inputProps={{
                    "aria-label": "E check",
                  }}
                  name="radio-buttons"
                />
              </div>
            </td>
            <td>
              <label
                htmlFor="paymentTypeACHRadio"
                className={
                  state.errorMap.paymentType.invalid
                    ? "text-error"
                    : state.formationFormData.paymentType === "ACH"
                    ? "text-success-dark text-bold"
                    : ""
                }
              >
                <Content>{BusinessFormationDefaults.achPaymentTypeLabel}</Content>
              </label>
            </td>
            <td
              className={state.formationFormData.paymentType === "ACH" ? "text-success-dark text-bold" : ""}
            >
              {getDollarValue(BusinessFormationDefaults.achPaymentCost)}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={1}>
              <div className="text-align-left">
                <span className="text-bold r">
                  {BusinessFormationDefaults.paymentTypeTableTotalCostLabel}
                </span>{" "}
              </div>
            </td>
            <td colSpan={1}></td>
            <td colSpan={1}>
              <div className="text-align-right text-bold">{getDollarValue(totalCost)}</div>
            </td>
          </tr>
        </tfoot>
      </table>
    </>
  );
};
