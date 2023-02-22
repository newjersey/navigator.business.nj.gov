import { Content } from "@/components/Content";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { ReactElement, useContext } from "react";

export const FormationChooseNotifications = (): ReactElement => {
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);

  const handleAnnualReportClick = () => {
    setFieldsInteracted(["annualReportNotification"]);
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        annualReportNotification: !state.formationFormData.annualReportNotification,
      };
    });
  };

  const handleCorpWatchClick = () => {
    setFieldsInteracted(["corpWatchNotification"]);
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        corpWatchNotification: !state.formationFormData.corpWatchNotification,
      };
    });
  };

  return (
    <div className="margin-top-3 margin-bottom-2">
      <h3>{Config.formation.sections.notificationsHeader}</h3>
      <Content>{Config.formation.sections.notificationsDescription}</Content>
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
          label={<Content>{Config.formation.fields.annualReportNotification.checkboxText}</Content>}
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
          label={<Content>{Config.formation.fields.corpWatchNotification.checkboxText}</Content>}
        />
      </FormGroup>
    </div>
  );
};
