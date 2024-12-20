import { getCost } from "@/components/tasks/business-formation/billing/getCost";
import { FormationField } from "@/components/tasks/business-formation/FormationField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { getDollarValue } from "@/lib/utils/formatters";
import { PaymentType } from "@businessnjgovnavigator/shared/";
import { FormHelperText, Radio } from "@mui/material";
import React, { ReactElement, useContext, useEffect, useState } from "react";

export const PaymentTypeTable = (): ReactElement<any> => {
  const fieldName = "paymentType";
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);

  const achPaymentCost = Number.parseFloat(Config.formation.fields.paymentType.paymentCosts.ach);
  const ccPaymentCostExtra = Number.parseFloat(
    Config.formation.fields.paymentType.paymentCosts.creditCardExtra
  );
  const ccPaymentCostInitial = Number.parseFloat(
    Config.formation.fields.paymentType.paymentCosts.creditCardInitial
  );

  const officialFormationCost = getCost("officialFormationDocument", state.formationFormData.legalType);
  const certifiedCopyCost = getCost("certifiedCopyOfFormationDocument", state.formationFormData.legalType);
  const certificateStandingCost = getCost("certificateOfStanding", state.formationFormData.legalType);

  const [totalCost, setTotalCost] = useState<number>(officialFormationCost);
  const [creditCardCost, setCreditCardCost] = useState<number>(ccPaymentCostInitial);
  const [achCost, setAchCost] = useState<number>(achPaymentCost);
  const { doesFieldHaveError } = useFormationErrors();

  useEffect(() => {
    const costs: number[] = [officialFormationCost];
    state.formationFormData.certificateOfStanding && costs.push(certificateStandingCost);
    state.formationFormData.certifiedCopyOfFormationDocument && costs.push(certifiedCopyCost);

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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        paymentType: event.target.value as PaymentType,
      };
    });
    setFieldsInteracted([fieldName]);
  };

  const hasError = doesFieldHaveError(fieldName);

  return (
    <FormationField fieldName={fieldName}>
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
              <td className={"padding-1"}>
                <Radio
                  id="paymentTypeCreditCardRadio"
                  color={hasError ? "error" : "primary"}
                  checked={state.formationFormData.paymentType === "CC"}
                  onChange={handleChange}
                  value="CC"
                  name="radio-buttons"
                />
              </td>
              <td>
                <label
                  htmlFor="paymentTypeCreditCardRadio"
                  className={
                    hasError
                      ? "text-error-dark"
                      : state.formationFormData.paymentType === "CC"
                      ? "text-primary-dark text-bold"
                      : ""
                  }
                >
                  <div data-testid={"paymentTypeCreditCardLabel"}>
                    {Config.formation.fields.paymentType.creditCardLabel}
                  </div>
                </label>
              </td>
              <td
                className={state.formationFormData.paymentType === "CC" ? "text-primary-dark text-bold" : ""}
              >
                {getDollarValue(creditCardCost)}
              </td>
            </tr>
            <tr>
              <td className={"padding-1"}>
                <Radio
                  id="paymentTypeACHRadio"
                  color={hasError ? "error" : "primary"}
                  checked={state.formationFormData.paymentType === "ACH"}
                  onChange={handleChange}
                  value="ACH"
                  name="radio-buttons"
                />
              </td>
              <td>
                <label
                  htmlFor="paymentTypeACHRadio"
                  className={
                    doesFieldHaveError(fieldName)
                      ? "text-error-dark"
                      : state.formationFormData.paymentType === "ACH"
                      ? "text-primary-dark text-bold"
                      : ""
                  }
                >
                  <div data-testid={"paymentTypeACHLabel"}>
                    {Config.formation.fields.paymentType.achLabel}
                  </div>
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
              <td colSpan={2}>
                <div className="text-align-left">
                  <span className="text-bold r">{Config.formation.fields.paymentType.costTotalLabel}</span>
                </div>
              </td>
              <td colSpan={1}>
                <div className="text-align-right text-bold" aria-label={"Total"}>
                  {getDollarValue(totalCost)}
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </WithErrorBar>
    </FormationField>
  );
};
