import { Content } from "@/components/Content";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";

export const BusinessFormationNotifications = (): ReactElement => {
  const { state, setFormationFormData } = useContext(FormationContext);

  const handleAnnualReportClick = () => {
    setFormationFormData({
      ...state.formationFormData,
      annualReportNotification: !state.formationFormData.annualReportNotification,
    });
  };

  const handleCorpWatchClick = () => {
    setFormationFormData({
      ...state.formationFormData,
      corpWatchNotification: !state.formationFormData.corpWatchNotification,
    });
  };

  return (
    <div className="margin-top-3 margin-bottom-2">
      <Content>{state.displayContent.notification.contentMd}</Content>{" "}
      <FormGroup>
        <FormControlLabel
          style={{ display: "table" }}
          control={
            <div style={{ display: "table-cell", width: "42px" }}>
              <Checkbox
                onChange={handleAnnualReportClick}
                checked={state.formationFormData.annualReportNotification}
              />
            </div>
          }
          label={<Content>{Config.businessFormationDefaults.optInAnnualReportText}</Content>}
        />
        <FormControlLabel
          style={{ display: "table" }}
          control={
            <div style={{ display: "table-cell", width: "42px" }}>
              <Checkbox
                onChange={handleCorpWatchClick}
                checked={state.formationFormData.corpWatchNotification}
              />
            </div>
          }
          label={<Content>{Config.businessFormationDefaults.optInCorpWatchText}</Content>}
        />
      </FormGroup>
    </div>
  );
};
