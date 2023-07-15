import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { LicenseSearchError } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { createEmptyNameAndAddress, NameAndAddress } from "@businessnjgovnavigator/shared/";
import { TextField } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { ChangeEvent, FormEvent, ReactElement, useState } from "react";

const useStyles = makeStyles(() => {
  return createStyles({
    disabledTextField: {
      background: "#e6e6e6",
    },
    zipCodeField: {
      "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
        {
          display: "none",
        },
    },
  });
});

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
  const { business } = useUserData();

  useMountEffectWhenDefined(() => {
    if (!business) return;

    if (business.licenseData) {
      setFormValues(business.licenseData.nameAndAddress);
    } else {
      setFormValues((prevValues) => {
        return {
          ...prevValues,
          name: business.profileData.businessName,
        };
      });
    }
  }, business);

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    analytics.event.task_address_form.submit.submitted_address_form();
    props.onSubmit(formValues);
  };

  const handleChangeForKey = (
    key: keyof NameAndAddress
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
            className="margin-top-2"
            value={formValues.name}
            onChange={handleChangeForKey("name")}
            variant="outlined"
            inputProps={{
              id: "business-name",
              "data-testid": "business-name",
            }}
          />
        </div>
        <div className="margin-bottom-2">
          <label htmlFor="address-1">{Config.licenseSearchTask.address1Label}</label>
          <TextField
            className="margin-top-2"
            value={formValues.addressLine1}
            onChange={handleChangeForKey("addressLine1")}
            variant="outlined"
            inputProps={{
              id: "address-1",
              "data-testid": "address-1",
            }}
          />
        </div>
        <div className="margin-bottom-2">
          <label htmlFor="address-2">{Config.licenseSearchTask.address2Label}</label>
          <TextField
            className="margin-top-2"
            value={formValues.addressLine2}
            onChange={handleChangeForKey("addressLine2")}
            variant="outlined"
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
              onChange={handleChangeForKey("zipCode")}
              variant="outlined"
              inputProps={{
                id: "zipcode",
                "data-testid": "zipcode",
                type: "number",
              }}
              className={`${classes.zipCodeField} margin-top-2`}
            />
          </div>
          <div className="flex-half padding-left-1">
            <label htmlFor="state">{Config.licenseSearchTask.stateLabel}</label>
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
              className={`${classes.disabledTextField} margin-top-2`}
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
              {Config.licenseSearchTask.submitText}
            </SecondaryButton>
          </div>
        </div>
      </form>
    </>
  );
};
