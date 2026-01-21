import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { templateEval } from "@/lib/utils/helpers";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { Task } from "@businessnjgovnavigator/shared/types";
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

export interface CRTKFacilityDetails {
  businessName: string;
  businessStreetAddress: string;
  city: string;
  state: string;
  zip: string;
  ein: string;
}

export type CRTKSearchError = "NOT_FOUND" | "FIELDS_REQUIRED" | "SEARCH_FAILED";

const useStyles = makeStyles(() => {
  return createStyles({
    zipCodeField: {
      "& input::-webkit-clear-button, & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
        {
          display: "none",
        },
    },
    errorField: {
      borderLeft: "4px solid #b50909",
      paddingLeft: "0.5rem",
    },
  });
});

interface Props {
  onSubmit: (facilityDetails: CRTKFacilityDetails) => Promise<void>;
  isLoading: boolean;
  task?: Task;
  searchError?: string;
  initialValues?: CRTKFacilityDetails;
}

interface FieldErrors {
  businessName?: string;
  businessStreetAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
}

const Config = getMergedConfig();

const CRTKErrorLookup: Record<CRTKSearchError, string> = {
  NOT_FOUND: Config.crtkTask.errorTextNotFound || "Business not found in CRTK database",
  FIELDS_REQUIRED: Config.crtkTask.errorTextFieldsRequired || "Please fill in all required fields",
  SEARCH_FAILED: Config.crtkTask.errorTextSearchFailed || "Search failed. Please try again.",
};

export const CRTKStatus = (props: Props): ReactElement => {
  const classes = useStyles();
  const [formValues, setFormValues] = useState<CRTKFacilityDetails>({
    businessName: "",
    businessStreetAddress: "",
    city: "",
    state: "NJ",
    zip: "",
    ein: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const { business } = useUserData();

  const errorAlertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!business) return;

    if (business?.formationData?.formationFormData) {
      setFormValues({
        businessName: business?.profileData.businessName || "",
        businessStreetAddress: business.formationData.formationFormData.addressLine1,
        city: business.formationData.formationFormData.addressMunicipality?.displayName || "",
        state: "NJ",
        zip: business.formationData.formationFormData.addressZipCode,
        ein: "",
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
      errors.businessName = Config.crtkTask.businessNameError;
    }

    if (!formValues.businessStreetAddress?.trim()) {
      errors.businessStreetAddress = Config.crtkTask.businessStreetAddressError;
    }

    if (!formValues.city?.trim()) {
      errors.city = Config.crtkTask.businessCityError;
    }

    if (!formValues.zip?.trim()) {
      errors.zip = Config.crtkTask.businessZipError;
    } else if (!/^\d{5}$/.test(formValues.zip.trim())) {
      errors.zip = "Enter a valid 5-digit zip code.";
    }

    return errors;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const errors = validateForm();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    // Call parent's onSubmit handler
    await props.onSubmit(formValues);
  };

  const handleChangeForKey = (
    key: keyof CRTKFacilityDetails,
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

  const handleBlurForKey = (key: keyof CRTKFacilityDetails): (() => void) => {
    return (): void => {
      if (fieldErrors[key as keyof FieldErrors]) {
        const value = formValues[key];

        if (key === "businessName" && value?.trim()) {
          setFieldErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors.businessName;
            return newErrors;
          });
        } else if (key === "businessStreetAddress" && value?.trim()) {
          setFieldErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors.businessStreetAddress;
            return newErrors;
          });
        } else if (key === "city" && value?.trim()) {
          setFieldErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors.city;
            return newErrors;
          });
        } else if (key === "state" && value?.trim()) {
          setFieldErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors.state;
            return newErrors;
          });
        } else if (key === "zip" && value?.trim() && /^\d{5}$/.test(value.trim())) {
          setFieldErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors.zip;
            return newErrors;
          });
        }
      }
    };
  };

  const getErrorAlert = (): ReactNode => {
    const hasFieldErrors = Object.keys(fieldErrors).length > 0;

    // Show field validation errors
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
                <strong>{Config.crtkTask.errorTextForm}</strong>
              </p>
              <ul className="margin-bottom-0">
                {fieldErrors.businessName && (
                  <li>
                    <a href="#question-business-name">{Config.crtkTask.businessNameLabel}</a>
                  </li>
                )}
                {fieldErrors.businessStreetAddress && (
                  <li>
                    <a href="#question-business-street-address">
                      {Config.crtkTask.businessStreetAddressLabel}
                    </a>
                  </li>
                )}
                {fieldErrors.city && (
                  <li>
                    <a href="#question-city">{Config.crtkTask.cityLabel}</a>
                  </li>
                )}
                {fieldErrors.state && (
                  <li>
                    <a href="#question-state">{Config.crtkTask.stateLabel}</a>
                  </li>
                )}
                {fieldErrors.zip && (
                  <li>
                    <a href="#question-zip">{Config.crtkTask.zipLabel}</a>
                  </li>
                )}
              </ul>
            </div>
          </Alert>
        </div>
      );
    }

    // Show search/API errors
    if (props.searchError) {
      return (
        <div className="margin-bottom-3">
          <Alert dataTestid={`error-alert-${props.searchError}`} variant="error">
            {CRTKErrorLookup[props.searchError as CRTKSearchError] || "An error occurred"}
          </Alert>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <style>
        {`
             .btn-accent-cooler[data-testid="crtk-submit"] .MuiCircularProgress-root {
              color: white !important;
            }
          `}
      </style>

      <div className="margin-bottom-4">
        <div className="text-base-darkest margin-bottom-2">
          <Content>
            {templateEval(Config.crtkTask.introText, {
              certainIndustriesLink: Config.crtkTask.certainIndustriesLink,
            })}
          </Content>
        </div>
      </div>
      <div className="bg-accent-cooler-50 padding-2 margin-bottom-3">
        <h2 className="margin-top-0 margin-bottom-1 text-accent-cooler">
          {Config.crtkTask.titleText}
        </h2>
        <p className="text-base-dark margin-bottom-0">{Config.crtkTask.helperText}</p>

        {getErrorAlert()}

        <form onSubmit={onSubmit}>
          <div
            className={`margin-bottom-2 ${fieldErrors.businessName ? classes.errorField : ""}`}
            id="question-business-name"
          >
            <label className="text-bold" htmlFor="business-name">
              {Config.crtkTask.businessNameLabel}
            </label>
            <TextField
              value={formValues?.businessName}
              onChange={handleChangeForKey("businessName")}
              variant="outlined"
              inputProps={{
                id: "business-name",
                "data-testid": "business-name",
              }}
              onBlur={handleBlurForKey("businessName")}
              error={!!fieldErrors.businessName}
              helperText={fieldErrors.businessName}
            />
          </div>

          <div
            className={`margin-bottom-2 ${fieldErrors.businessStreetAddress ? classes.errorField : ""}`}
            id="question-business-street-address"
          >
            <label className="text-bold" htmlFor="business-street-address">
              {Config.crtkTask.businessStreetAddressLabel}
            </label>
            <TextField
              value={formValues?.businessStreetAddress}
              onChange={handleChangeForKey("businessStreetAddress")}
              variant="outlined"
              inputProps={{
                id: "business-street-address",
                "data-testid": "business-street-address",
              }}
              onBlur={handleBlurForKey("businessStreetAddress")}
              error={!!fieldErrors.businessStreetAddress}
              helperText={fieldErrors.businessStreetAddress}
            />
          </div>

          <div className={`fdr margin-bottom-2 ${fieldErrors.zip ? classes.errorField : ""}`}>
            <div className={`flex-1 padding-right-1 `}>
              <div id="question-city">
                <label className="text-bold" htmlFor="city">
                  {Config.crtkTask.cityLabel}
                </label>
                <TextField
                  value={formValues?.city}
                  onChange={handleChangeForKey("city")}
                  variant="outlined"
                  inputProps={{
                    id: "city",
                    "data-testid": "city",
                  }}
                  onBlur={handleBlurForKey("city")}
                  error={!!fieldErrors.city}
                  helperText={fieldErrors.city}
                />
              </div>
            </div>
            <div className="flex-1 padding-x-1">
              <div id="question-state">
                <label className="text-bold" htmlFor="state">
                  {Config.crtkTask.stateLabel}
                </label>
                <TextField
                  value={"NJ"}
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
            <div className={`flex-1 padding-left-1`}>
              <div id="question-zip">
                <label className="text-bold" htmlFor="zip">
                  {Config.crtkTask.zipLabel}
                </label>
                <TextField
                  value={formValues?.zip}
                  onChange={handleChangeForKey("zip")}
                  variant="outlined"
                  inputProps={{
                    id: "zip",
                    "data-testid": "zip",
                    maxLength: 5,
                  }}
                  className={classes.zipCodeField}
                  onBlur={handleBlurForKey("zip")}
                  error={!!fieldErrors.zip}
                  helperText={fieldErrors.zip}
                />
              </div>
            </div>
          </div>

          <div className="margin-bottom-2">
            <label className="text-bold flex" htmlFor="ein">
              <Content>
                {templateEval(Config.crtkTask.einLabel, {
                  certainIndustriesLink: Config.crtkTask.certainIndustriesLink,
                })}
              </Content>
              <span className="text-normal"> {Config.crtkTask.einOptionalText}</span>
            </label>
            <TextField
              value={formValues?.ein}
              onChange={handleChangeForKey("ein")}
              variant="outlined"
              inputProps={{
                id: "ein",
                "data-testid": "ein",
              }}
            />
          </div>

          <div className="flex flex-row">
            <div className="mla">
              <PrimaryButton
                isColor="accent-cooler"
                isSubmitButton={true}
                isRightMarginRemoved={true}
                onClick={(): void => {}}
                isLoading={props.isLoading}
                dataTestId="crtk-submit"
              >
                {Config.crtkTask.submitText}
              </PrimaryButton>
            </div>
          </div>
        </form>
      </div>
      <div className="bg-warning-lighter padding-2 margin-top-4">
        <div className="display-flex ">
          <div>
            <p className="margin-top-0 margin-bottom-1 text-accent-warm-darker text-bold">
              {Config.crtkTask.warningTitle}
            </p>
            <p className="margin-bottom-0 text-accent-warm-darker">{Config.crtkTask.warningText}</p>
          </div>
        </div>
      </div>
      <div className="bg-info-lighter  padding-2 margin-top-2 ">
        <p className="margin-top-0 margin-bottom-1 text-accent-cool-more-dark text-bold">
          {Config.crtkTask.federalInfoTitle}
        </p>
        <p className="margin-bottom-1 text-accent-cool-more-dark">
          {Config.crtkTask.federalInfoText}
        </p>
        <a href="https://www.epa.gov/epcra" className="text-underline text-accent-cool-more-dark">
          {Config.crtkTask.federalLinkText}
        </a>
      </div>
    </>
  );
};
