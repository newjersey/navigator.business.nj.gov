import React, { ChangeEvent, FormEvent, ReactElement, useState } from "react";
import { TextField } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { LicenseScreenDefaults } from "@/display-content/tasks/license/LicenseScreenDefaults";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { createEmptyNameAndAddress, NameAndAddress } from "@/lib/types/types";
import { Alert } from "@/components/njwds/Alert";
import { LicenseSearchError } from "@/components/tasks/LicenseTask";
import { LoadingButton } from "@/components/njwds-extended/LoadingButton";
import { SearchBusinessNamesDefaults } from "@/display-content/tasks/search-business-names/SearchBusinessNamesDefaults";
import analytics from "@/lib/utils/analytics";

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
  NOT_FOUND: LicenseScreenDefaults.errorTextNotFound,
  FIELDS_REQUIRED: LicenseScreenDefaults.errorTextFieldsRequired,
  SEARCH_FAILED: SearchBusinessNamesDefaults.errorTextSearchFailed,
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
        name: userData.onboardingData.businessName,
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
      <Alert
        data-testid={`error-alert-${props.error}`}
        slim
        variant="error"
        className="margin-y-2 no-margin-top"
      >
        {LicenseSearchErrorLookup[props.error]}
      </Alert>
    );
  };

  return (
    <>
      {getErrorAlert()}
      <p className="margin-bottom-4 margin-top-3">{LicenseScreenDefaults.checkStatusText}</p>
      <form onSubmit={onSubmit}>
        <div className="margin-bottom-2">
          <label htmlFor="business-name">{LicenseScreenDefaults.businessNameLabel}</label>
          <TextField
            value={formValues.name}
            onChange={handleChange("name")}
            variant="outlined"
            fullWidth
            placeholder={LicenseScreenDefaults.businessNamePlaceholder}
            inputProps={{
              id: "business-name",
              "data-testid": "business-name",
            }}
          />
        </div>
        <div className="margin-bottom-2">
          <label htmlFor="address-1">{LicenseScreenDefaults.address1Label}</label>
          <TextField
            value={formValues.addressLine1}
            onChange={handleChange("addressLine1")}
            variant="outlined"
            fullWidth
            placeholder={LicenseScreenDefaults.address1Placeholder}
            inputProps={{
              id: "address-1",
              "data-testid": "address-1",
            }}
          />
        </div>
        <div className="margin-bottom-2">
          <label htmlFor="address-2">{LicenseScreenDefaults.address2Label}</label>
          <TextField
            value={formValues.addressLine2}
            onChange={handleChange("addressLine2")}
            variant="outlined"
            fullWidth
            placeholder={LicenseScreenDefaults.address2Placeholder}
            inputProps={{
              id: "address-2",
              "data-testid": "address-2",
            }}
          />
        </div>
        <div className="fdr flex-half">
          <div className="flex-half padding-right-1">
            <label htmlFor="city">{LicenseScreenDefaults.zipCodeLabel}</label>
            <TextField
              value={formValues.zipCode}
              onChange={handleChange("zipCode")}
              variant="outlined"
              fullWidth
              placeholder={LicenseScreenDefaults.zipCodePlaceholder}
              inputProps={{
                id: "zipcode",
                "data-testid": "zipcode",
                type: "number",
              }}
              className={`${classes.zipCodeField}`}
            />
          </div>
          <div className="flex-half padding-left-1">
            <label htmlFor="state">{LicenseScreenDefaults.stateLabel}</label>
            <TextField
              value={"New Jersey"}
              onChange={() => {}}
              variant="outlined"
              fullWidth
              placeholder={LicenseScreenDefaults.statePlaceholder}
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
          <LoadingButton
            type="submit"
            onClick={() => {}}
            loading={props.isLoading}
            className="usa-button mla margin-top-4 margin-bottom-1 margin-right-0"
            outline={true}
            data-testid="check-status-submit"
            marginClass="spinner-margin-36"
          >
            {LicenseScreenDefaults.submitText}
          </LoadingButton>
        </div>
      </form>
    </>
  );
};
