import { Alert } from "@/components/njwds-extended/Alert";
import { LicenseSearchError } from "@/components/tasks/LicenseTask";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { createEmptyNameAndAddress, NameAndAddress } from "@businessnjgovnavigator/shared";
import { TextField } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import React, { ChangeEvent, FormEvent, ReactElement, useState } from "react";
import { Button } from "../njwds-extended/Button";

const useStyles = makeStyles(() =>
  createStyles({
    disabledTextField: {
      background: "#e6e6e6",
    },
    zipCodeField: {
      "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
        {
          display: "none",
        },
    },
  })
);

interface Props {
  onSubmit: (nameAndAddress: NameAndAddress) => void;
  error: LicenseSearchError | undefined;
  isLoading: boolean;
}

const LicenseSearchErrorLookup: Record<LicenseSearchError, string> = {
  NOT_FOUND: Config.licenseSearchTask.errorTextNotFound,
  FIELDS_REQUIRED: Config.licenseSearchTask.errorTextFieldsRequired,
  SEARCH_FAILED: Config.searchBusinessNameTask.errorTextSearchFailed,
};

export const CheckStatus = (props: Props): ReactElement => {
  const classes = useStyles();
  const [formValues, setFormValues] = useState<NameAndAddress>(createEmptyNameAndAddress());
  const { userData } = useUserData();

  useMountEffectWhenDefined(() => {
    if (!userData) return;

    if (userData.licenseData) {
      setFormValues(userData.licenseData.nameAndAddress);
    } else {
      setFormValues({
        ...formValues,
        name: userData.profileData.businessName,
      });
    }
  }, userData);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    analytics.event.task_address_form.submit.submitted_address_form();
    props.onSubmit(formValues);
  };

  const handleChange =
    (key: keyof NameAndAddress) =>
    (event: ChangeEvent<HTMLInputElement>): void => {
      setFormValues({
        ...formValues,
        [key]: event.target.value,
      });
    };

  const getErrorAlert = (): ReactElement => {
    if (!props.error) return <></>;
    return (
      <Alert dataTestid={`error-alert-${props.error}`} variant="error">
        {LicenseSearchErrorLookup[props.error]}
      </Alert>
    );
  };

  return (
    <>
      {getErrorAlert()}
      <p className="margin-bottom-4 margin-top-3">{Config.licenseSearchTask.checkStatusText}</p>
      <form onSubmit={onSubmit}>
        <div className="margin-bottom-2">
          <label htmlFor="business-name">{Config.licenseSearchTask.businessNameLabel}</label>
          <TextField
            value={formValues.name}
            onChange={handleChange("name")}
            variant="outlined"
            fullWidth
            placeholder={Config.licenseSearchTask.businessNamePlaceholder}
            inputProps={{
              id: "business-name",
              "data-testid": "business-name",
            }}
          />
        </div>
        <div className="margin-bottom-2">
          <label htmlFor="address-1">{Config.licenseSearchTask.address1Label}</label>
          <TextField
            value={formValues.addressLine1}
            onChange={handleChange("addressLine1")}
            variant="outlined"
            fullWidth
            placeholder={Config.licenseSearchTask.address1Placeholder}
            inputProps={{
              id: "address-1",
              "data-testid": "address-1",
            }}
          />
        </div>
        <div className="margin-bottom-2">
          <label htmlFor="address-2">{Config.licenseSearchTask.address2Label}</label>
          <TextField
            value={formValues.addressLine2}
            onChange={handleChange("addressLine2")}
            variant="outlined"
            fullWidth
            placeholder={Config.licenseSearchTask.address2Placeholder}
            inputProps={{
              id: "address-2",
              "data-testid": "address-2",
            }}
          />
        </div>
        <div className="fdr flex-half">
          <div className="flex-half padding-right-1">
            <label htmlFor="city">{Config.licenseSearchTask.zipCodeLabel}</label>
            <TextField
              value={formValues.zipCode}
              onChange={handleChange("zipCode")}
              variant="outlined"
              fullWidth
              placeholder={Config.licenseSearchTask.zipCodePlaceholder}
              inputProps={{
                id: "zipcode",
                "data-testid": "zipcode",
                type: "number",
              }}
              className={`${classes.zipCodeField}`}
            />
          </div>
          <div className="flex-half padding-left-1">
            <label htmlFor="state">{Config.licenseSearchTask.stateLabel}</label>
            <TextField
              value={"New Jersey"}
              onChange={() => {}}
              variant="outlined"
              fullWidth
              placeholder={Config.licenseSearchTask.statePlaceholder}
              inputProps={{
                id: "state",
                "data-testid": "state",
                style: {
                  color: "#1b1b1b",
                },
              }}
              disabled
              className={`${classes.disabledTextField}`}
            />
          </div>
        </div>
        <div className="flex flex-row">
          <div className="mla margin-top-4">
            <Button
              style="secondary"
              typeSubmit
              noRightMargin
              onClick={() => {}}
              loading={props.isLoading}
              dataTestid="check-status-submit"
            >
              {Config.licenseSearchTask.submitText}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};
