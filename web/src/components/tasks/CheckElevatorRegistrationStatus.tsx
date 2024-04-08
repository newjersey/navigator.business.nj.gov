import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { getMergedConfig } from "@/contexts/configContext";
import { ElevatorRegistrationSearchError } from "@/lib/types/types";
import { ElevatorSafetyAddress } from "@businessnjgovnavigator/shared/elevatorSafety";
import { TextField } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { ChangeEvent, FormEvent, ReactElement, useState } from "react";

const useStyles = makeStyles(() => {
  return createStyles({
    zipCodeField: {
      "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
        {
          display: "none",
        },
    },
  });
});

interface Props {
  onSubmit: (address: ElevatorSafetyAddress) => void;
  error: ElevatorRegistrationSearchError | undefined;
  isLoading: boolean;
}

const Config = getMergedConfig();
const ElevatorSearchErrorLookup: Record<ElevatorRegistrationSearchError, string> = {
  NO_PROPERTY_INTEREST_FOUND: Config.elevatorRegistrationSearchTask.errorTextNoPropertyInterestFound,
  NO_ELEVATOR_REGISTRATIONS_FOUND: Config.elevatorRegistrationSearchTask.errorTextNoElevatorRegistrations,
  FIELDS_REQUIRED: Config.elevatorRegistrationSearchTask.errorTextFieldsRequired,
  SEARCH_FAILED: Config.elevatorRegistrationSearchTask.errorTextSearchFailed,
};

export const CheckElevatorRegistrationStatus = (props: Props): ReactElement => {
  const classes = useStyles();
  const [formValues, setFormValues] = useState<ElevatorSafetyAddress>({ address1: "" });
  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    props.onSubmit(formValues);
  };

  const handleChangeForKey = (
    key: keyof ElevatorSafetyAddress
  ): ((event: ChangeEvent<HTMLInputElement>) => void) => {
    return (event: ChangeEvent<HTMLInputElement>): void => {
      setFormValues((prevValues) => {
        return {
          ...prevValues,
          [key]: event.target.value,
        };
      });
    };
  };

  const getErrorAlert = (): ReactElement => {
    if (!props.error) {
      return <></>;
    }
    return (
      <Alert dataTestid={`error-alert-${props.error}`} variant="error">
        {ElevatorSearchErrorLookup[props.error]}
      </Alert>
    );
  };

  return (
    <>
      {getErrorAlert()}
      {Config.elevatorRegistrationSearchTask.registrationSearchPrompt}
      <form onSubmit={onSubmit} className={"padding-top-1"}>
        <div className="margin-bottom-2">
          <label htmlFor="address-1">{Config.elevatorRegistrationSearchTask.address1Label}</label>
          <TextField
            value={formValues.address1}
            onChange={handleChangeForKey("address1")}
            variant="outlined"
            inputProps={{
              id: "address-1",
              "data-testid": "address-1",
            }}
          />
        </div>
        <div className="margin-bottom-2">
          <label htmlFor="address-2">{Config.elevatorRegistrationSearchTask.address2Label}</label>
          <TextField
            value={formValues.address2}
            onChange={handleChangeForKey("address2")}
            variant="outlined"
            inputProps={{
              id: "address-2",
              "data-testid": "address-2",
            }}
          />
        </div>
        <div className="fdr flex-half">
          <div className="flex-half padding-right-1">
            <label htmlFor="city">{Config.elevatorRegistrationSearchTask.zipCodeLabel}</label>
            <TextField
              value={formValues.zipCode}
              onChange={handleChangeForKey("zipCode")}
              variant="outlined"
              inputProps={{
                id: "zipcode",
                "data-testid": "zipcode",
                type: "number",
              }}
              className={`${classes.zipCodeField}`}
            />
          </div>
          <div className="flex-half padding-left-1">
            <label htmlFor="state">{Config.elevatorRegistrationSearchTask.stateLabel}</label>
            <TextField
              value={"New Jersey"}
              onChange={(): void => {}}
              variant="outlined"
              inputProps={{
                id: "state",
                "data-testid": "state",
                style: {
                  color: "#1b1b1b",
                },
              }}
              disabled
            />
          </div>
        </div>
        <div className="flex flex-row">
          <div className="mla margin-top-4">
            <SecondaryButton
              isColor="primary"
              isSubmitButton={true}
              isRightMarginRemoved={true}
              onClick={(): void => {}}
              isLoading={props.isLoading}
              dataTestId="check-status-submit"
            >
              {Config.elevatorRegistrationSearchTask.submitText}
            </SecondaryButton>
          </div>
        </div>
      </form>
    </>
  );
};
