import { Content } from "@/components/Content";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import React, { ReactElement, useContext } from "react";
import { FormationContext } from "../BusinessFormation";

export const BusinessFormationNotifications = (): ReactElement => {
  const { state, setFormationData } = useContext(FormationContext);

  const handleAnnualReportClick = () => {
    setFormationData({
      ...state.formationData,
      annualReportNotification: !state.formationData.annualReportNotification,
    });
  };

  const handleCorpWatchClick = () => {
    setFormationData({
      ...state.formationData,
      corpWatchNotification: !state.formationData.corpWatchNotification,
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
