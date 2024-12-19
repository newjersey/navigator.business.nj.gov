import { ContextualInfoButton } from "@/components/ContextualInfoButton";
import { getCost } from "@/components/tasks/business-formation/billing/getCost";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getDollarValue } from "@/lib/utils/formatters";
import { Checkbox } from "@mui/material";
import { ReactElement, useContext, useEffect, useState } from "react";

export const FormationChooseDocuments = (): ReactElement<any> => {
  const { Config } = useConfig();

  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);

  const officialFormationCost = getCost("officialFormationDocument", state.formationFormData.legalType);
  const certifiedCopyCost = getCost("certifiedCopyOfFormationDocument", state.formationFormData.legalType);
  const certificateStandingCost = getCost("certificateOfStanding", state.formationFormData.legalType);

  const [totalCost, setTotalCost] = useState<number>(officialFormationCost);

  useEffect(() => {
    let minCost = officialFormationCost;
    if (state.formationFormData.certificateOfStanding) {
      minCost += certificateStandingCost;
    }
    if (state.formationFormData.certifiedCopyOfFormationDocument) {
      minCost += certifiedCopyCost;
    }
    setTotalCost(minCost);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.formationFormData.certificateOfStanding,
    state.formationFormData.certifiedCopyOfFormationDocument,
  ]);

  const handleCertificateOfStandingClick = (): void => {
    setFieldsInteracted(["certificateOfStanding"]);
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        certificateOfStanding: !state.formationFormData.certificateOfStanding,
      };
    });
  };

  const handleCertifiedFormationDocumentClick = (): void => {
    setFieldsInteracted(["certifiedCopyOfFormationDocument"]);
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        certifiedCopyOfFormationDocument: !state.formationFormData.certifiedCopyOfFormationDocument,
      };
    });
  };

  return (
    <div className={`margin-top-3`}>
      <table className="business-formation-table business-formation-document">
        <thead>
          <tr>
            <th className="text-bold">{Config.formation.fields.paymentType.serviceColumnLabel}</th>
            <th></th>
            <th className="text-bold">{Config.formation.fields.paymentType.costColumnLabel}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className={"padding-1"}>
              <div data-testid="officialFormationDocument-checkbox">
                <Checkbox disabled defaultChecked id="officialFormationDocument" />
              </div>
            </td>
            <td>
              <label
                data-testid="officialFormationDocument"
                htmlFor="officialFormationDocument"
                className={"text-primary-dark text-bold"}
              >
                <ContextualInfoButton
                  text={Config.formation.fields.officialFormationDocument.label}
                  id={Config.formation.fields.officialFormationDocument.labelContextualInfo}
                />
              </label>
            </td>
            <td className={"text-primary-dark text-bold"}>{getDollarValue(officialFormationCost)}</td>
          </tr>
          <tr>
            <td className={"padding-1"}>
              <div data-testid="certificateOfStanding-checkbox">
                <Checkbox
                  onChange={handleCertificateOfStandingClick}
                  id="certificateOfStanding"
                  checked={state.formationFormData.certificateOfStanding}
                />
              </div>
            </td>
            <td>
              <label
                htmlFor="certificateOfStanding"
                data-testid="certificateOfStanding"
                className="display-inline-flex fww"
              >
                <div
                  className={
                    state.formationFormData.certificateOfStanding ? "text-primary-dark text-bold" : ""
                  }
                >
                  <ContextualInfoButton
                    text={Config.formation.fields.certificateOfStanding.label}
                    id={Config.formation.fields.certificateOfStanding.labelContextualInfo}
                  />
                </div>
                <span className="margin-left-05">{Config.formation.general.optionalLabel}</span>
              </label>
            </td>
            <td
              className={state.formationFormData.certificateOfStanding ? "text-primary-dark text-bold" : ""}
            >
              {getDollarValue(certificateStandingCost)}
            </td>
          </tr>
          <tr>
            <td className={"padding-1"}>
              <div data-testid="certifiedCopyOfFormationDocument-checkbox">
                <Checkbox
                  onChange={handleCertifiedFormationDocumentClick}
                  id="certifiedCopyOfFormationDocument"
                  checked={state.formationFormData.certifiedCopyOfFormationDocument}
                />
              </div>
            </td>
            <td>
              <label
                data-testid="certifiedCopyOfFormationDocument"
                htmlFor="certifiedCopyOfFormationDocument"
                className="display-inline-flex fww"
              >
                <div
                  className={
                    state.formationFormData.certifiedCopyOfFormationDocument
                      ? "text-primary-dark text-bold"
                      : ""
                  }
                >
                  <ContextualInfoButton
                    text={Config.formation.fields.certifiedCopyOfFormationDocument.label}
                    id={Config.formation.fields.certifiedCopyOfFormationDocument.labelContextualInfo}
                  />
                </div>
                <span className="margin-left-05">{Config.formation.general.optionalLabel}</span>
              </label>
            </td>
            <td
              className={
                state.formationFormData.certifiedCopyOfFormationDocument ? "text-primary-dark text-bold" : ""
              }
            >
              {getDollarValue(certifiedCopyCost)}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={1}>
              <div className="text-align-left">
                <span className="text-bold">{Config.formation.fields.paymentType.costSubtotalLabel}</span>{" "}
              </div>
            </td>
            <td colSpan={1}></td>
            <td colSpan={1}>
              <div className="text-align-right text-bold" aria-label="Subtotal">
                {getDollarValue(totalCost)}
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
