import { Alert } from "@/components/njwds-extended/Alert";
import { LicenseSearchError } from "@/components/tasks/LicenseTask";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
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
  NOT_FOUND: Defaults.licenseSearchTask.errorTextNotFound,
  FIELDS_REQUIRED: Defaults.licenseSearchTask.errorTextFieldsRequired,
  SEARCH_FAILED: Defaults.searchBusinessNameTask.errorTextSearchFailed,
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
      <p className="margin-bottom-4 margin-top-3">{Defaults.licenseSearchTask.checkStatusText}</p>
      <form onSubmit={onSubmit}>
        <div className="margin-bottom-2">
          <label htmlFor="business-name">{Defaults.licenseSearchTask.businessNameLabel}</label>
          <TextField
            value={formValues.name}
            onChange={handleChange("name")}
            variant="outlined"
            fullWidth
            placeholder={Defaults.licenseSearchTask.businessNamePlaceholder}
            inputProps={{
              id: "business-name",
              "data-testid": "business-name",
            }}
          />
        </div>
        <div className="margin-bottom-2">
          <label htmlFor="address-1">{Defaults.licenseSearchTask.address1Label}</label>
          <TextField
            value={formValues.addressLine1}
            onChange={handleChange("addressLine1")}
            variant="outlined"
            fullWidth
            placeholder={Defaults.licenseSearchTask.address1Placeholder}
            inputProps={{
              id: "address-1",
              "data-testid": "address-1",
            }}
          />
        </div>
        <div className="margin-bottom-2">
          <label htmlFor="address-2">{Defaults.licenseSearchTask.address2Label}</label>
          <TextField
            value={formValues.addressLine2}
            onChange={handleChange("addressLine2")}
            variant="outlined"
            fullWidth
            placeholder={Defaults.licenseSearchTask.address2Placeholder}
            inputProps={{
              id: "address-2",
              "data-testid": "address-2",
            }}
          />
        </div>
        <div className="fdr flex-half">
          <div className="flex-half padding-right-1">
            <label htmlFor="city">{Defaults.licenseSearchTask.zipCodeLabel}</label>
            <TextField
              value={formValues.zipCode}
              onChange={handleChange("zipCode")}
              variant="outlined"
              fullWidth
              placeholder={Defaults.licenseSearchTask.zipCodePlaceholder}
              inputProps={{
                id: "zipcode",
                "data-testid": "zipcode",
                type: "number",
              }}
              className={`${classes.zipCodeField}`}
            />
          </div>
          <div className="flex-half padding-left-1">
            <label htmlFor="state">{Defaults.licenseSearchTask.stateLabel}</label>
            <TextField
              value={"New Jersey"}
              onChange={() => {}}
              variant="outlined"
              fullWidth
              placeholder={Defaults.licenseSearchTask.statePlaceholder}
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
              {Defaults.licenseSearchTask.submitText}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
};
