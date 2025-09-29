import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { BusinessName } from "@/components/tasks/business-formation/name/BusinessName";
import { SubmittedFormToReserveName } from "@/components/tasks/business-formation/name/SubmittedFormToReserveName";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { ReactElement, useContext } from "react";

export const BusinessNameStep = (): ReactElement => {
  const { Config } = useConfig();
  const { state, setFormationFormData } = useContext(BusinessFormationContext);

  const handleCheckNameReservation = (
    _: React.ChangeEvent<HTMLInputElement>,
    value: string,
  ): void => {
    const boolValue = value === "true" ? true : false;
    setFormationFormData((prev) => ({
      ...prev,
      checkNameReservation: boolValue,
    }));

    if (boolValue) {
      analytics.event.formation_task_name_reservation_yes_option.click.show_additional_options();
    }
  };

  return (
    <div data-testid="business-name-step">
      <Heading level={2}>{Config.formation.checkNameReservation.header}</Heading>
      <div id="checkNameReservation" className="padding-top-1">
        <Content className="text-bold">
          {Config.formation.checkNameReservation.didYouUseFormRadio.label}
        </Content>
        <FormControl fullWidth>
          <RadioGroup
            aria-label={Config.formation.checkNameReservation.didYouUseFormRadio.label}
            name="check-name-reservation"
            value={state.formationFormData.checkNameReservation}
            onChange={handleCheckNameReservation}
          >
            <FormControlLabel
              labelPlacement="end"
              style={{ alignItems: "center" }}
              data-testid="check-name-reservation-option-1"
              value={false}
              control={<Radio color="primary" />}
              label={Config.formation.checkNameReservation.didYouUseFormRadio.option1}
            />
            <FormControlLabel
              labelPlacement="end"
              style={{ alignItems: "center" }}
              data-testid="check-name-reservation-option-2"
              value={true}
              control={<Radio color="primary" />}
              label={Config.formation.checkNameReservation.didYouUseFormRadio.option2}
            />
          </RadioGroup>
        </FormControl>

        {state.formationFormData.checkNameReservation ? (
          <SubmittedFormToReserveName />
        ) : (
          <>
            <hr className="margin-y-3" />
            <Heading level={2}>{Config.formation.fields.businessName.header}</Heading>
            <Content>{Config.formation.fields.businessName.description}</Content>
            <BusinessName />
          </>
        )}
      </div>
    </div>
  );
};
