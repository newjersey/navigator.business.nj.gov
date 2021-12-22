import { Content } from "@/components/Content";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";
import { FormationContext } from "../BusinessFormation";

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
    <div className="margin-y-2">
      <Content>{state.displayContent.notification.contentMd}</Content>{" "}
      <FormGroup>
        <FormControlLabel
          control={<Checkbox onChange={handleAnnualReportClick} />}
          label={<Content>{state.displayContent.optInAnnualReport.contentMd}</Content>}
        />
        <FormControlLabel
          control={<Checkbox onChange={handleCorpWatchClick} />}
          label={<Content>{state.displayContent.optInCorpWatch.contentMd}</Content>}
        />
      </FormGroup>
    </div>
  );
};
