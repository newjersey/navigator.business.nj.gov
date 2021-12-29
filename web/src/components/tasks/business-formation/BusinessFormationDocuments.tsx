import { Content } from "@/components/Content";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { addTwoDollarValues, subtractTwoDollarValues } from "@/lib/utils/helpers";
import { Checkbox } from "@mui/material";
import React, { ReactElement, useContext, useState } from "react";
import { FormationContext } from "../BusinessFormation";

export const BusinessFormationDocuments = (): ReactElement => {
  const { state, setFormationFormData } = useContext(FormationContext);
  const [totalCost, setTotalCost] = useState<string>(state.displayContent.officialFormationDocument.cost);

  const handleCertificateOfStandingClick = () => {
    const value = !state.formationFormData.certificateOfStanding
      ? addTwoDollarValues(totalCost, state.displayContent.certificateOfStanding.cost)
      : subtractTwoDollarValues(totalCost, state.displayContent.certificateOfStanding.cost);

    setFormationFormData({
      ...state.formationFormData,
      certificateOfStanding: !state.formationFormData.certificateOfStanding,
    });
    setTotalCost(value);
  };

  const handleCertifiedFormationDocumentClick = () => {
    const value = !state.formationFormData.certifiedCopyOfFormationDocument
      ? addTwoDollarValues(totalCost, state.displayContent.certifiedCopyOfFormationDocument.cost)
      : subtractTwoDollarValues(totalCost, state.displayContent.certifiedCopyOfFormationDocument.cost);

    setFormationFormData({
      ...state.formationFormData,
      certifiedCopyOfFormationDocument: !state.formationFormData.certifiedCopyOfFormationDocument,
    });

    setTotalCost(value);
  };

  return (
    <div className="margin-y-3">
      <table className="business-formation-documents">
        <thead>
          <tr>
            <th></th>
            <th className="text-bold">{BusinessFormationDefaults.documentTableColumn2Label}</th>
            <th className="text-bold">{BusinessFormationDefaults.documentTableColumn3Label}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div className="business-formation-documents-table-checkboxes">
                <Checkbox disabled defaultChecked id="officialFormationDocument" />
              </div>
            </td>
            <td>
              <label htmlFor="officialFormationDocument">
                <Content>{state.displayContent.officialFormationDocument.contentMd}</Content>
              </label>
            </td>
            <td>{state.displayContent.officialFormationDocument.cost}</td>
          </tr>
          <tr>
            <td>
              <div className="business-formation-documents-table-checkboxes">
                <Checkbox
                  onChange={handleCertificateOfStandingClick}
                  id="certificateOfStanding"
                  checked={state.formationFormData.certificateOfStanding}
                />
              </div>
            </td>
            <td>
              <label htmlFor="certificateOfStanding">
                <Content>{state.displayContent.certificateOfStanding.contentMd}</Content>
              </label>
              {state.displayContent.certificateOfStanding.optionalLabel}
            </td>
            <td>{state.displayContent.certificateOfStanding.cost}</td>
          </tr>
          <tr>
            <td>
              <div className="business-formation-documents-table-checkboxes">
                <Checkbox
                  onChange={handleCertifiedFormationDocumentClick}
                  id="certifiedCopyOfFormationDocument"
                  checked={state.formationFormData.certifiedCopyOfFormationDocument}
                />
              </div>
            </td>
            <td>
              <label htmlFor="certifiedCopyOfFormationDocument">
                <Content>{state.displayContent.certifiedCopyOfFormationDocument.contentMd}</Content>
              </label>
              {state.displayContent.certifiedCopyOfFormationDocument.optionalLabel}
            </td>
            <td>{state.displayContent.certifiedCopyOfFormationDocument.cost}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}>
              <div className="text-align-right">
                <span className="text-bold">{BusinessFormationDefaults.documentTableTotalCostLabel}</span>{" "}
                {totalCost}
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
