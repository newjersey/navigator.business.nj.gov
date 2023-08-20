import { Content } from "@/components/Content";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { ReactElement, useContext } from "react";

export const FormationChooseNotifications = (): ReactElement => {
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);

  const handleAnnualReportClick = (): void => {
    setFieldsInteracted(["annualReportNotification"]);
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        annualReportNotification: !state.formationFormData.annualReportNotification,
      };
    });
  };

  const handleCorpWatchClick = (): void => {
    setFieldsInteracted(["corpWatchNotification"]);
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        corpWatchNotification: !state.formationFormData.corpWatchNotification,
      };
    });
  };

  return (
    <div className="margin-top-3">
      <h3>{Config.formation.sections.notificationsHeader}</h3>
      <Content>{Config.formation.sections.notificationsDescription}</Content>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              onChange={handleAnnualReportClick}
              checked={state.formationFormData.annualReportNotification}
            />
          }
          label={<Content>{Config.formation.fields.annualReportNotification.checkboxText}</Content>}
        />
        <FormControlLabel
          control={
            <Checkbox
              onChange={handleCorpWatchClick}
              checked={state.formationFormData.corpWatchNotification}
            />
          }
          label={<Content>{Config.formation.fields.corpWatchNotification.checkboxText}</Content>}
        />
      </FormGroup>
    </div>
  );
};
