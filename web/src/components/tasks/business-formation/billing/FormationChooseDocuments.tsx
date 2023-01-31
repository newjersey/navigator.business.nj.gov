import { Content } from "@/components/Content";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { getDollarValue } from "@/lib/utils/formatters";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Checkbox } from "@mui/material";
import { ReactElement, useContext, useEffect, useState } from "react";

export const FormationChooseDocuments = (): ReactElement => {
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const [totalCost, setTotalCost] = useState<number>(state.displayContent.officialFormationDocument.cost);

  useEffect(() => {
    let minCost = state.displayContent.officialFormationDocument.cost;
    if (state.formationFormData.certificateOfStanding) {
      minCost += state.displayContent.certificateOfStanding.cost;
    }
    if (state.formationFormData.certifiedCopyOfFormationDocument) {
      minCost += state.displayContent.certifiedCopyOfFormationDocument.cost;
    }
    setTotalCost(minCost);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.formationFormData.certificateOfStanding,
    state.formationFormData.certifiedCopyOfFormationDocument,
  ]);

  const handleCertificateOfStandingClick = () => {
    setFieldsInteracted(["certificateOfStanding"]);
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        certificateOfStanding: !state.formationFormData.certificateOfStanding,
      };
    });
  };

  const handleCertifiedFormationDocumentClick = () => {
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
            <th className="text-bold">{Config.businessFormationDefaults.documentTableColumn2Label}</th>
            <th></th>
            <th className="text-bold">{Config.businessFormationDefaults.documentTableColumn3Label}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div className="business-formation-table-checkboxes">
                <Checkbox disabled defaultChecked id="officialFormationDocument" />
              </div>
            </td>
            <td>
              <label htmlFor="officialFormationDocument" className={"text-primary-dark text-bold"}>
                <Content>{state.displayContent.officialFormationDocument.contentMd}</Content>
              </label>
            </td>
            <td className={"text-primary-dark text-bold"}>
              {getDollarValue(state.displayContent.officialFormationDocument.cost)}
            </td>
          </tr>
          <tr>
            <td>
              <div className="business-formation-table-checkboxes">
                <Checkbox
                  onChange={handleCertificateOfStandingClick}
                  id="certificateOfStanding"
                  checked={state.formationFormData.certificateOfStanding}
                />
              </div>
            </td>
            <td>
              <label htmlFor="certificateOfStanding" className="display-inline-flex fww">
                <Content
                  className={
                    state.formationFormData.certificateOfStanding ? "text-primary-dark text-bold" : ""
                  }
                >
                  {state.displayContent.certificateOfStanding.contentMd}
                </Content>
                &nbsp;{state.displayContent.certificateOfStanding.optionalLabel}
              </label>
            </td>
            <td
              className={state.formationFormData.certificateOfStanding ? "text-primary-dark text-bold" : ""}
            >
              {getDollarValue(state.displayContent.certificateOfStanding.cost)}
            </td>
          </tr>
          <tr>
            <td>
              <div className="business-formation-table-checkboxes">
                <Checkbox
                  onChange={handleCertifiedFormationDocumentClick}
                  id="certifiedCopyOfFormationDocument"
                  checked={state.formationFormData.certifiedCopyOfFormationDocument}
                />
              </div>
            </td>
            <td>
              <label htmlFor="certifiedCopyOfFormationDocument" className="display-inline-flex fww">
                <Content
                  className={
                    state.formationFormData.certifiedCopyOfFormationDocument
                      ? "text-primary-dark text-bold"
                      : ""
                  }
                >
                  {state.displayContent.certifiedCopyOfFormationDocument.contentMd}
                </Content>
                &nbsp;{state.displayContent.certifiedCopyOfFormationDocument.optionalLabel}
              </label>
            </td>
            <td
              className={
                state.formationFormData.certifiedCopyOfFormationDocument ? "text-primary-dark text-bold" : ""
              }
            >
              {getDollarValue(state.displayContent.certifiedCopyOfFormationDocument.cost)}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={1}>
              <div className="text-align-left">
                <span className="text-bold">
                  {Config.businessFormationDefaults.documentTableSubTotalCostLabel}
                </span>{" "}
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
