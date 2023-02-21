import { Content } from "@/components/Content";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { getDollarValue } from "@/lib/utils/formatters";
import { PaymentType } from "@businessnjgovnavigator/shared/";
import { FormHelperText, Radio } from "@mui/material";
import React, { ReactElement, useContext, useEffect, useState } from "react";

export const PaymentTypeTable = (): ReactElement => {
  const FIELD = "paymentType";
  const { Config } = useConfig();
  const achPaymentCost = Number.parseFloat(Config.formation.fields.paymentType.paymentCosts.ach);
  const ccPaymentCostExtra = Number.parseFloat(
    Config.formation.fields.paymentType.paymentCosts.creditCardExtra
  );
  const ccPaymentCostInitial = Number.parseFloat(
    Config.formation.fields.paymentType.paymentCosts.creditCardInitial
  );

  const { state, setFormationFormData } = useContext(BusinessFormationContext);
  const [totalCost, setTotalCost] = useState<number>(state.displayContent.officialFormationDocument.cost);
  const [creditCardCost, setCreditCardCost] = useState<number>(ccPaymentCostInitial);
  const [achCost, setAchCost] = useState<number>(achPaymentCost);
  const { doesFieldHaveError } = useFormationErrors();

  useEffect(() => {
    const costs = [state.displayContent.officialFormationDocument.cost];
    state.formationFormData.certificateOfStanding &&
      costs.push(state.displayContent.certificateOfStanding.cost);

    state.formationFormData.certifiedCopyOfFormationDocument &&
      costs.push(state.displayContent.certifiedCopyOfFormationDocument.cost);

    const achCost = costs.length * achPaymentCost;
    const creditCardCost = ccPaymentCostInitial + (costs.length - 1) * ccPaymentCostExtra;

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
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        paymentType: event.target.value as PaymentType,
      };
    });
  };

  const hasError = doesFieldHaveError(FIELD);

  return (
    <WithErrorBar hasError={hasError} type="ALWAYS">
      <table className="business-formation-table business-formation-payment">
        <thead>
          <tr>
            <th className="text-bold">{Config.formation.fields.paymentType.label}</th>
            <th></th>
            <th></th>
          </tr>
          <tr>
            <th colSpan={3}>
              {hasError ? (
                <FormHelperText className={"text-error-dark"}>
                  {Config.formation.fields.paymentType.error}
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
                    ? "text-error-dark"
                    : state.formationFormData.paymentType === "CC"
                    ? "text-primary-dark text-bold"
                    : ""
                }
              >
                <Content>{Config.formation.fields.paymentType.creditCardLabel}</Content>
              </label>
            </td>
            <td className={state.formationFormData.paymentType === "CC" ? "text-primary-dark text-bold" : ""}>
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
                    ? "text-error-dark"
                    : state.formationFormData.paymentType === "ACH"
                    ? "text-primary-dark text-bold"
                    : ""
                }
              >
                <Content>{Config.formation.fields.paymentType.achLabel}</Content>
              </label>
            </td>
            <td
              className={state.formationFormData.paymentType === "ACH" ? "text-primary-dark text-bold" : ""}
            >
              {getDollarValue(achCost)}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={1}>
              <div className="text-align-left">
                <span className="text-bold r">{Config.formation.fields.paymentType.costTotalLabel}</span>{" "}
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
    </WithErrorBar>
  );
};
