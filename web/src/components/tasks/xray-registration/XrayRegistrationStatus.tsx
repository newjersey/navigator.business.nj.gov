import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { getMergedConfig } from "@/contexts/configContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import type { FacilityDetails, XraySearchError } from "@businessnjgovnavigator/shared/";
import { TextField } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import {
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useState,
} from "react";

const useStyles = makeStyles(() => {
  return createStyles({
    addressZipCodeField: {
      "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
        {
          display: "none",
        },
    },
  });
});

interface Props {
  onSubmit: (facilityDetails: FacilityDetails) => void;
  error: XraySearchError | undefined;
  isLoading: boolean;
}

const Config = getMergedConfig();

const XrayRegistrationErrorLookup: Record<XraySearchError, string> = {
  NOT_FOUND: Config.xrayRegistrationTask.errorTextNotFound,
  FIELDS_REQUIRED: Config.xrayRegistrationTask.errorTextFieldsRequired,
  SEARCH_FAILED: Config.xrayRegistrationTask.errorTextSearchFailed,
};

export const XrayRegistrationStatus = (props: Props): ReactElement => {
  const classes = useStyles();
  const [formValues, setFormValues] = useState<FacilityDetails>({
    businessName: "",
    addressLine1: "",
    addressLine2: "",
    addressZipCode: "",
  });
  const { business } = useUserData();

  useEffect(() => {
    if (!business) return;

    const nameAndAddress = business.xrayRegistrationData?.facilityDetails;

    const hasNameAndAddress =
      nameAndAddress?.businessName &&
      nameAndAddress?.addressLine1 &&
      nameAndAddress?.addressZipCode;

    if (nameAndAddress && hasNameAndAddress) {
      setFormValues(nameAndAddress);
    } else if (business.formationData?.formationResponse?.success) {
      setFormValues((prevValues) => {
        return {
          ...prevValues,
          businessName: business.formationData.formationFormData.businessName,
          addressLine1: business.formationData.formationFormData.addressLine1,
          addressLine2: business.formationData.formationFormData.addressLine2 || "",
          addressZipCode: business.formationData.formationFormData.addressZipCode,
        };
      });
    } else {
      setFormValues((prevValues) => {
        return {
          ...prevValues,
          businessName: business.profileData?.businessName,
          addressLine1: business.formationData?.formationFormData?.addressLine1,
          addressLine2: business.formationData?.formationFormData?.addressLine2 || "",
          addressZipCode: business.formationData?.formationFormData?.addressZipCode,
        };
      });
    }
  }, [business]);

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    analytics.event.task_address_form.submit.submitted_address_form();
    props.onSubmit(formValues);
  };

  const handleChangeForKey = (
    key: keyof FacilityDetails,
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

  const getErrorAlert = (): ReactNode => {
    if (!props.error) {
      return <></>;
    } else if (props.error === "NOT_FOUND") {
      return (
        <Alert dataTestid={`error-alert-${props.error}`} variant="warning">
          {XrayRegistrationErrorLookup[props.error]}
        </Alert>
      );
    } else {
      return (
        <Alert dataTestid={`error-alert-${props.error}`} variant="error">
          {XrayRegistrationErrorLookup[props.error]}
        </Alert>
      );
    }
  };

  return (
    <>
      {getErrorAlert()}
      <p className="margin-bottom-4 margin-top-3">{Config.xrayRegistrationTask.checkStatusText}</p>
      <form onSubmit={onSubmit}>
        <div className="margin-bottom-2">
          <label className="text-bold" htmlFor="business-name">
            {Config.xrayRegistrationTask.businessNameLabel}
          </label>
          <TextField
            value={formValues?.businessName}
            onChange={handleChangeForKey("businessName")}
            variant="outlined"
            inputProps={{
              id: "business-name",
              "data-testid": "business-name",
            }}
          />
        </div>
        <div className="margin-bottom-2">
          <label className="text-bold" htmlFor="address-1">
            {Config.xrayRegistrationTask.address1Label}
          </label>
          <TextField
            value={formValues?.addressLine1}
            onChange={handleChangeForKey("addressLine1")}
            variant="outlined"
            inputProps={{
              id: "address-1",
              "data-testid": "address-1",
            }}
          />
        </div>
        <div className="margin-bottom-2">
          <label className="text-bold" htmlFor="address-2">
            {Config.xrayRegistrationTask.address2Label}
          </label>
          <TextField
            value={formValues?.addressLine2}
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
            <label className="text-bold" htmlFor="addressZipCode">
              {Config.xrayRegistrationTask.addressZipCodeLabel}
            </label>
            <TextField
              value={formValues?.addressZipCode}
              onChange={handleChangeForKey("addressZipCode")}
              variant="outlined"
              inputProps={{
                id: "addressZipCode",
                "data-testid": "addressZipCode",
                type: "number",
              }}
              className={`${classes.addressZipCodeField}`}
            />
          </div>
          <div className="flex-half padding-left-1">
            <label className="text-bold" htmlFor="state">
              {Config.xrayRegistrationTask.stateLabel}
            </label>
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
              {Config.xrayRegistrationTask.submitText}
            </SecondaryButton>
          </div>
        </div>
      </form>
    </>
  );
};
