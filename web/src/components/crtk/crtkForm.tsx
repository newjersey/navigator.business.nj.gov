import { Alert } from "@/components/njwds-extended/Alert";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import * as api from "@/lib/api-client/apiClient";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { Task } from "@businessnjgovnavigator/shared/types";
//import type { CRTKFacilityDetails, CRTKSearchError } from "@businessnjgovnavigator/shared/";
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
  });
});

interface Props {
  onSubmit: (facilityDetails: CRTKFacilityDetails) => void;
  isLoading: boolean;
  task?: Task;
}

interface FieldErrors {
  businessName?: string;
  businessStreetAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
}

const Config = getMergedConfig();

// const CRTKErrorLookup: Record<CRTKSearchError, string> = {
//   NOT_FOUND: Config.crtkTask.errorTextNotFound,
//   FIELDS_REQUIRED: Config.crtkTask.errorTextFieldsRequired,
//   SEARCH_FAILED: Config.crtkTask.errorTextSearchFailed,
// };

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

    //const crtkData = business.crtkData?.facilityDetails;

    //     const hasCRTKData =
    //       crtkData?.businessName && crtkData?.businessStreetAddress && crtkData?.city && crtkData?.zip;

    //     if (crtkData && hasCRTKData) {
    //       setFormValues(crtkData);
    //     } else if (business.formationData?.formationResponse?.success) {
    //       setFormValues((prevValues) => {
    //         return {
    //           ...prevValues,
    //           businessName: business.formationData.formationFormData.businessName,
    //           businessStreetAddress: business.formationData.formationFormData.addressLine1,
    //           city: business.formationData.formationFormData.addressCity || "",
    //           state: "NJ",
    //           zip: business.formationData.formationFormData.addressZipCode,
    //         };
    //       });
    //     } else {
    //       setFormValues((prevValues) => {
    //         return {
    //           ...prevValues,
    //           businessName: business.profileData?.businessName,
    //           businessStreetAddress: business.formationData?.formationFormData?.addressLine1,
    //           city: business.formationData?.formationFormData?.addressCity || "",
    //           state: "NJ",
    //           zip: business.formationData?.formationFormData?.addressZipCode,
    //         };
    //       });
    //     }
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

    if (!formValues.businessStreetAddress?.trim()) {
      errors.businessStreetAddress = "Enter your business street address.";
    }

    if (!formValues.city?.trim()) {
      errors.city = "Enter your city.";
    }

    if (!formValues.state?.trim()) {
      errors.state = "Enter your state.";
    }

    if (!formValues.zip?.trim()) {
      errors.zip = "Enter your zip code.";
    } else if (!/^\d{5}$/.test(formValues.zip.trim())) {
      errors.zip = "Enter a valid 5-digit zip code.";
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

    api
      .searchBuisnessInCRTKDB({
        businessName: "Hola Moco",
        addressLine1: "Conde",
        city: "Paterson",
        addressZipCode: "940022",
      })
      .then(() => {
        console.log("successfull");
      })
      .catch(() => {
        console.log("error!!");
      });
    console.log(formValues);

    // props.onSubmit(formValues);
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
                    <a href="#question-business-name">Business Name</a>
                  </li>
                )}
                {fieldErrors.businessStreetAddress && (
                  <li>
                    <a href="#question-business-street-address">Business Street Address</a>
                  </li>
                )}
                {fieldErrors.city && (
                  <li>
                    <a href="#question-city">City</a>
                  </li>
                )}
                {fieldErrors.state && (
                  <li>
                    <a href="#question-state">State</a>
                  </li>
                )}
                {fieldErrors.zip && (
                  <li>
                    <a href="#question-zip">Zip</a>
                  </li>
                )}
              </ul>
            </div>
          </Alert>
        </div>
      );
    }
  };

  return (
    <>
      <div className="margin-bottom-4">
        <p className="text-base-darkest margin-bottom-2">{Config.crtkTask.introText}</p>
      </div>
      <div className="bg-accent-cooler-50 padding-2 margin-bottom-3">
        <h2 className="margin-top-0 margin-bottom-1 text-accent-cooler">
          Tell Us About Your Business
        </h2>
        <p className="text-base-dark margin-bottom-0">{Config.crtkTask.helperText}</p>

        {getErrorAlert()}
        <form onSubmit={onSubmit}>
          <div className="margin-bottom-2" id="question-business-name">
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

          <div className="margin-bottom-2" id="question-business-street-address">
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

          <div className="fdr flex-half margin-bottom-2">
            <div className="flex-half padding-right-1" id="question-city">
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
            <div className="flex-half padding-left-1" id="question-state">
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

          <div className="margin-bottom-2" id="question-zip">
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
                type: "number",
              }}
              className={classes.zipCodeField}
              onBlur={handleBlurForKey("zip")}
              error={!!fieldErrors.zip}
              helperText={fieldErrors.zip}
            />
          </div>

          <div className="margin-bottom-2">
            <label className="text-bold" htmlFor="ein">
              {Config.crtkTask.einLabel}{" "}
              <span className="text-normal">{Config.crtkTask.einOptionalText}</span>
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
            <div className="mla margin-top-4">
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
            <h3 className="margin-top-0 margin-bottom-1 text-accent-warm-darker text-bold">
              {Config.crtkTask.warningTitle}
            </h3>
            <p className="margin-bottom-0 text-accent-warm-darker">{Config.crtkTask.warningText}</p>
          </div>
        </div>
      </div>
      <div className="bg-info-lighter  padding-2 margin-top-2 ">
        <h3 className="margin-top-0 margin-bottom-1 text-accent-cool-more-dark text-bold">
          {Config.crtkTask.federalInfoTitle}
        </h3>
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
