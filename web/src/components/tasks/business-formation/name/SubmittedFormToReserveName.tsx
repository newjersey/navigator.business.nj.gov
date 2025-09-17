import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { Heading } from "@/components/njwds-extended/Heading";
import { BusinessName } from "@/components/tasks/business-formation/name/BusinessName";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { HowToProceedOptions } from "@businessnjgovnavigator/shared/formationData";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { ReactElement, useContext } from "react";

export const SubmittedFormToReserveName = (): ReactElement => {
  const { Config } = useConfig();
  const { state, setFormationFormData } = useContext(BusinessFormationContext);

  const handleHowToProceed = (_: React.ChangeEvent<HTMLInputElement>, value: string): void => {
    setFormationFormData((prev) => ({
      ...prev,
      howToProceed: value as HowToProceedOptions,
    }));
  };

  return (
    <div id="howWouldYouLikeToProceedRadio" className="padding-top-1">
      <Alert variant="warning">
        <Content className="padding-bottom-2">
          {Config.formation.checkNameReservation.alreadyReservedAlertHeader}
        </Content>
        {Config.formation.checkNameReservation.alreadyReservedAlertInfo}
      </Alert>

      <Content className="text-bold padding-top-2">
        {Config.formation.checkNameReservation.howWouldYouLikeToProceedRadio.label}
      </Content>
      <FormControl fullWidth>
        <RadioGroup
          aria-label={Config.formation.checkNameReservation.howWouldYouLikeToProceedRadio.label}
          name="how-to-proceed"
          value={state.formationFormData.howToProceed}
          onChange={handleHowToProceed}
        >
          <FormControlLabel
            labelPlacement="end"
            style={{ alignItems: "center" }}
            data-testid="how-to-proceed-option-1"
            value="DIFFERENT_NAME"
            control={<Radio color="primary" />}
            label={Config.formation.checkNameReservation.howWouldYouLikeToProceedRadio.option1}
          />
          <FormControlLabel
            labelPlacement="end"
            style={{ alignItems: "center" }}
            data-testid="how-to-proceed-option-2"
            value="KEEP_NAME"
            control={<Radio color="primary" />}
            label={Config.formation.checkNameReservation.howWouldYouLikeToProceedRadio.option2}
          />
          <FormControlLabel
            labelPlacement="end"
            style={{ alignItems: "center" }}
            data-testid="how-to-proceed-option-3"
            value="CANCEL_NAME"
            control={<Radio color="primary" />}
            label={Config.formation.checkNameReservation.howWouldYouLikeToProceedRadio.option3}
          />
        </RadioGroup>
      </FormControl>

      <hr className="margin-y-3" />

      {state.formationFormData.howToProceed === "DIFFERENT_NAME" && (
        <>
          <Heading level={2}>
            {Config.formation.checkNameReservation.registerDifferentNameHeader}
          </Heading>
          <div>{Config.formation.checkNameReservation.registerDifferentNameLine1}</div>
          <div className="margin-top-1">
            {Config.formation.checkNameReservation.registerDifferentNameLine2}
          </div>
          <BusinessName />
        </>
      )}

      {state.formationFormData.howToProceed === "KEEP_NAME" && (
        <>
          <Heading level={2}>{Config.formation.checkNameReservation.keepNameHeader}</Heading>
          <Content className="margin-y-2">
            {Config.formation.checkNameReservation.keepNameStep1}
          </Content>
          <Content className="margin-y-2">
            {Config.formation.checkNameReservation.keepNameStep2}
          </Content>
          <Content className="margin-top-2">
            {Config.formation.checkNameReservation.keepNameAddressLine1}
          </Content>
          <Content>{Config.formation.checkNameReservation.keepNameAddressLine2}</Content>
          <Content>{Config.formation.checkNameReservation.keepNameAddressLine3}</Content>
          <Content className="margin-y-2">
            {Config.formation.checkNameReservation.keepNameStep3}
          </Content>
          <div className="fdc fac">
            <img
              className="margin-top-2 margin-bottom-4"
              src={`/img/todo-click-example.jpg`}
              alt="example of clicking todo box"
            />
          </div>
        </>
      )}

      {state.formationFormData.howToProceed === "CANCEL_NAME" && (
        <>
          <Heading level={2}>{Config.formation.checkNameReservation.cancelNameHeader}</Heading>
          <Content className="margin-y-2">
            {Config.formation.checkNameReservation.cancelNameStep1}
          </Content>
          <Content className="margin-y-2">
            {Config.formation.checkNameReservation.cancelNameStep2}
          </Content>
          <Content className="margin-y-2">
            {Config.formation.checkNameReservation.cancelNameStep3}
          </Content>
          <Content className="margin-y-2">
            {Config.formation.checkNameReservation.cancelNameStep4}
          </Content>
          <BusinessName />
        </>
      )}
    </div>
  );
};
