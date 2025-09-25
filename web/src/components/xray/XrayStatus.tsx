import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import type { FacilityDetails, XraySearchError } from "@businessnjgovnavigator/shared/";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { TextField } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import {
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
  type ReactNode,
  useEffect,
  useRef,
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
    errorLink: {
      color: "#0071bc",
      textDecoration: "underline",
      cursor: "pointer",
      background: "none",
      border: "none",
      padding: 0,
      font: "inherit",
      "&:hover": {
        textDecoration: "none",
      },
    },
  });
});

interface Props {
  onSubmit: (facilityDetails: FacilityDetails) => void;
  error: XraySearchError | undefined;
  isLoading: boolean;
}

interface FieldErrors {
  businessName?: string;
  addressLine1?: string;
  addressZipCode?: string;
}

const Config = getMergedConfig();

const XrayRegistrationErrorLookup: Record<XraySearchError, string> = {
  NOT_FOUND: Config.xrayRegistrationTask.errorTextNotFound,
  FIELDS_REQUIRED: Config.xrayRegistrationTask.errorTextFieldsRequired,
  SEARCH_FAILED: Config.xrayRegistrationTask.errorTextSearchFailed,
};

export const XrayStatus = (props: Props): ReactElement => {
  const classes = useStyles();
  const [formValues, setFormValues] = useState<FacilityDetails>({
    businessName: "",
    addressLine1: "",
    addressLine2: "",
    addressZipCode: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { business } = useUserData();

  const businessNameRef = useRef<HTMLInputElement>(null);
  const addressLine1Ref = useRef<HTMLInputElement>(null);
  const addressZipCodeRef = useRef<HTMLInputElement>(null);
  const errorAlertRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (Object.keys(fieldErrors).length > 0 && errorAlertRef.current) {
      errorAlertRef.current.focus();
    }
  }, [fieldErrors]);

  const validateForm = (): FieldErrors => {
    const errors: FieldErrors = {};

    if (!formValues.businessName?.trim()) {
      errors.businessName = "Enter your business name.";
    }

    if (!formValues.addressLine1?.trim()) {
      errors.addressLine1 = "Enter your facility's street name and number";
    }

    if (!formValues.addressZipCode?.trim()) {
      errors.addressZipCode = "Enter your Zip code";
    } else if (!/^\d{5}(-\d{4})?$/.test(formValues.addressZipCode.trim())) {
      errors.addressZipCode = "Enter a valid 5-digit zip code";
    }

    return errors;
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

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

  const handleBlurForKey = (key: keyof FacilityDetails): (() => void) => {
    return (): void => {
      if (fieldErrors[key as keyof FieldErrors]) {
        const value = formValues[key];

        if (key === "businessName" && value?.trim()) {
          setFieldErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors.businessName;
            return newErrors;
          });
        } else if (key === "addressLine1" && value?.trim()) {
          setFieldErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors.addressLine1;
            return newErrors;
          });
        } else if (
          key === "addressZipCode" &&
          value?.trim() &&
          /^\d{5}(-\d{4})?$/.test(value.trim())
        ) {
          setFieldErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors.addressZipCode;
            return newErrors;
          });
        }
      }
    };
  };

  const focusOnField = (fieldName: keyof FieldErrors): void => {
    const refs = {
      businessName: businessNameRef,
      addressLine1: addressLine1Ref,
      addressZipCode: addressZipCodeRef,
    };

    const ref = refs[fieldName];
    if (ref?.current) {
      ref.current.focus();
    }
  };

  const getErrorAlert = (): ReactNode => {
    const hasFieldErrors = Object.keys(fieldErrors).length > 0;

    if (hasFieldErrors) {
      return (
        <div
          ref={errorAlertRef}
          role="alert"
          aria-live="assertive"
          tabIndex={-1}
          className="margin-bottom-3"
        >
          <Alert dataTestid="error-alert-FIELDS_REQUIRED" variant="error">
            <div>
              <p className="margin-bottom-2">
                <strong>Review the following fields for errors and missing information:</strong>
              </p>
              <ul className="margin-bottom-0">
                {fieldErrors.businessName && (
                  <li>
                    <button
                      type="button"
                      className={classes.errorLink}
                      onClick={() => focusOnField("businessName")}
                    >
                      Business Name
                    </button>
                  </li>
                )}
                {fieldErrors.addressLine1 && (
                  <li>
                    <button
                      type="button"
                      className={classes.errorLink}
                      onClick={() => focusOnField("addressLine1")}
                    >
                      Facility Address Line 1
                    </button>
                  </li>
                )}
                {fieldErrors.addressZipCode && (
                  <li>
                    <button
                      type="button"
                      className={classes.errorLink}
                      onClick={() => focusOnField("addressZipCode")}
                    >
                      Zip Code
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </Alert>
        </div>
      );
    }

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
          <div className={"text-base-darkest"}>
            Enter your business name exactly as it appears on your x-ray registration form.
          </div>
          <TextField
            value={formValues?.businessName}
            onChange={handleChangeForKey("businessName")}
            variant="outlined"
            inputProps={{
              id: "business-name",
              "data-testid": "business-name",
            }}
            inputRef={businessNameRef}
            onBlur={handleBlurForKey("businessName")}
            className={fieldErrors.businessName}
          />
          {fieldErrors.businessName && (
            <div id="business-name-error" className={"text-error-dark"}>
              {fieldErrors.businessName}
            </div>
          )}
        </div>
        <div className="margin-bottom-2">
          <label className="text-bold" htmlFor="address-1">
            {Config.xrayRegistrationTask.address1Label}
          </label>
          <div className={"text-base-darkest"}>
            Enter the address of the facility exactly as it appears on your x-ray registration form.
          </div>
          <TextField
            value={formValues?.addressLine1}
            onChange={handleChangeForKey("addressLine1")}
            variant="outlined"
            inputProps={{
              id: "address-1",
              "data-testid": "address-1",
            }}
            inputRef={addressLine1Ref}
            onBlur={handleBlurForKey("addressLine1")}
            className={fieldErrors.addressLine1}
          />
          {fieldErrors.addressLine1 && (
            <div id="address-1-error" className={"text-error-dark"}>
              {fieldErrors.addressLine1}
            </div>
          )}
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
              inputRef={addressZipCodeRef}
              onBlur={handleBlurForKey("addressZipCode")}
            />
            {fieldErrors.addressZipCode && (
              <div id="zip-code-error" className={"text-error-dark"}>
                {fieldErrors.addressZipCode}
              </div>
            )}
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
