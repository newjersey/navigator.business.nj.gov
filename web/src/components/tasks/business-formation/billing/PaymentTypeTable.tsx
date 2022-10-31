import { Content } from "@/components/Content";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { getDollarValue } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { PaymentType } from "@businessnjgovnavigator/shared/";
import { FormHelperText, Radio } from "@mui/material";
import React, { ReactElement, useContext, useEffect, useState } from "react";

export const PaymentTypeTable = (): ReactElement => {
  const FIELD = "paymentType";
  const achPaymentCost = Number.parseFloat(Config.businessFormationDefaults.achPaymentCost);
  const creditCardPaymentCostExtra = Number.parseFloat(
    Config.businessFormationDefaults.creditCardPaymentCostExtra
  );
  const creditCardPaymentCostInitial = Number.parseFloat(
    Config.businessFormationDefaults.creditCardPaymentCostInitial
  );

  const { state, setFormationFormData } = useContext(BusinessFormationContext);
  const [totalCost, setTotalCost] = useState<number>(state.displayContent.officialFormationDocument.cost);
  const [creditCardCost, setCreditCardCost] = useState<number>(creditCardPaymentCostInitial);
  const [achCost, setAchCost] = useState<number>(achPaymentCost);
  const { doesFieldHaveError } = useFormationErrors();

  useEffect(() => {
    const costs = [state.displayContent.officialFormationDocument.cost];
    state.formationFormData.certificateOfStanding &&
      costs.push(state.displayContent.certificateOfStanding.cost);

    state.formationFormData.certifiedCopyOfFormationDocument &&
      costs.push(state.displayContent.certifiedCopyOfFormationDocument.cost);

    const achCost = costs.length * achPaymentCost;
    const creditCardCost = creditCardPaymentCostInitial + (costs.length - 1) * creditCardPaymentCostExtra;

    state.formationFormData.paymentType === "ACH" && costs.push(achCost);

    state.formationFormData.paymentType === "CC" && costs.push(creditCardCost);

    setCreditCardCost(creditCardCost);
    setAchCost(achCost);
    setTotalCost(
      costs.reduce((a, b) => {
        return a + b;
      }, 0)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.formationFormData.certificateOfStanding,
    state.formationFormData.paymentType,
    state.formationFormData.certifiedCopyOfFormationDocument,
  ]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormationFormData({
      ...state.formationFormData,
      paymentType: event.target.value as PaymentType,
    });
  };

  const hasError = doesFieldHaveError(FIELD);

  return (
    <div className={`${hasError ? "error" : ""} input-error-bar`}>
      <table className="business-formation-table business-formation-payment">
        <thead>
          <tr>
            <th className="text-bold">{Config.businessFormationDefaults.paymentTypeTableLabel}</th>
            <th></th>
            <th></th>
          </tr>
          <tr>
            <th colSpan={3}>
              {hasError ? (
                <FormHelperText className={"text-error-dark"}>
                  {Config.businessFormationDefaults.paymentTypeErrorText}
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
                  color={hasError ? "error" : "primary"}
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
                  hasError
                    ? "text-error"
                    : state.formationFormData.paymentType === "CC"
                    ? "text-success-dark text-bold"
                    : ""
                }
              >
                <Content>{Config.businessFormationDefaults.creditCardPaymentTypeLabel}</Content>
              </label>
            </td>
            <td className={state.formationFormData.paymentType === "CC" ? "text-success-dark text-bold" : ""}>
              {getDollarValue(creditCardCost)}
            </td>
          </tr>
          <tr>
            <td>
              <div className="business-formation-table-checkboxes">
                <Radio
                  id="paymentTypeACHRadio"
                  color={hasError ? "error" : "primary"}
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
                  doesFieldHaveError(FIELD)
                    ? "text-error"
                    : state.formationFormData.paymentType === "ACH"
                    ? "text-success-dark text-bold"
                    : ""
                }
              >
                <Content>{Config.businessFormationDefaults.achPaymentTypeLabel}</Content>
              </label>
            </td>
            <td
              className={state.formationFormData.paymentType === "ACH" ? "text-success-dark text-bold" : ""}
            >
              {getDollarValue(achCost)}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={1}>
              <div className="text-align-left">
                <span className="text-bold r">
                  {Config.businessFormationDefaults.paymentTypeTableTotalCostLabel}
                </span>{" "}
              </div>
            </td>
            <td colSpan={1}></td>
            <td colSpan={1}>
              <div className="text-align-right text-bold" aria-label={"Total"}>
                {getDollarValue(totalCost)}
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
