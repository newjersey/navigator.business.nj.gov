import { Content } from "@/components/Content";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { ReactElement, useContext } from "react";

export const FormationChooseNotifications = (): ReactElement => {
  const { state, setFormationFormData, setFieldInteracted } = useContext(BusinessFormationContext);

  const handleAnnualReportClick = () => {
    setFieldInteracted("annualReportNotification");
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        annualReportNotification: !state.formationFormData.annualReportNotification,
      };
    });
  };

  const handleCorpWatchClick = () => {
    setFieldInteracted("corpWatchNotification");
    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        corpWatchNotification: !state.formationFormData.corpWatchNotification,
      };
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
