import type { Dispatch, MouseEvent, SetStateAction } from "react";
import { ReactElement, useContext, useState } from "react";
import { Heading } from "../njwds-extended/Heading";
import { Content } from "@/components/Content";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { isUndefined } from "lodash";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { EmployerRatesQuarterDropdown } from "@/components/employer-rates/EmployerRatesQuarterDropdown";
import {
  EmployerRatesQuarterObject,
  getEmployerAccessQuarterlyDropdownOptions,
} from "@/lib/domain-logic/getEmployerAccessQuarterlyDropdownOptions";
import { getCurrentDate } from "@businessnjgovnavigator/shared/dateHelpers";
import { WithErrorBar } from "@/components/WithErrorBar";
import { getProfileErrorAlertText } from "@/components/profile/getProfileErrorAlertText";
import { Alert } from "@/components/njwds-extended/Alert";
import * as api from "@/lib/api-client/apiClient";
import { decryptValue } from "@/lib/api-client/apiClient";
import { useUserData } from "@/lib/data-hooks/useUserData";
import {
  DOL_EIN_CHARACTERS,
  EmployerRatesRequest,
  EmployerRatesResponse,
} from "@businessnjgovnavigator/shared";
import { DolEin } from "@/components/data-fields/DolEin";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useMountEffect } from "@/lib/utils/helpers";

interface Props {
  CMS_ONLY_enable_preview?: boolean;
  setResponse: Dispatch<SetStateAction<false | EmployerRatesResponse>>;
  quarter: EmployerRatesQuarterObject;
  setQuarter: Dispatch<SetStateAction<EmployerRatesQuarterObject>>;
  handleChangeOverride?: (() => void) | undefined;
}

export const EmployerRatesQuestions = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { userData, updateQueue } = useUserData();
  const { setIsValid } = useFormContextFieldHelpers("deptOfLaborEin", DataFormErrorMapContext);
  const [showEmployerAccessRadio, setShowEmployerAccessRadio] = useState<boolean>(true);

  useMountEffect(() => {
    if (
      state?.profileData.employerAccessRegistration === true &&
      state?.profileData.deptOfLaborEin.length > 0
    ) {
      setShowEmployerAccessRadio(false);
    }
  });

  const initialEmployerAccess = isUndefined(state?.profileData.employerAccessRegistration)
    ? ""
    : String(state?.profileData.employerAccessRegistration);

  const [employerAccessRegistration, setEmployerAccessRegistration] =
    useState<string>(initialEmployerAccess);

  const previewMode = props.CMS_ONLY_enable_preview;
  const shouldShowEmployerAccessInputFields = employerAccessRegistration === "true" || previewMode;
  const shouldShowEmployerAccessRegistrationLink =
    employerAccessRegistration === "false" || previewMode;

  const dropdownOptions = getEmployerAccessQuarterlyDropdownOptions(getCurrentDate());

  const [dolEinError, setDolEinError] = useState<boolean>(previewMode || false);
  const [serverError, setServerError] = useState<boolean>(previewMode || false);
  const [noAccountError, setNoAccountError] = useState<boolean>(previewMode || false);

  const handleDolEinChange = (value: string): void => {
    if (props.handleChangeOverride) {
      props.handleChangeOverride();
    } else {
      setProfileData((prev) => ({
        ...prev,
        deptOfLaborEin: value,
      }));
    }
  };

  const isDolEinValid = (value: string): boolean => !!value && value.length === DOL_EIN_CHARACTERS;

  const handleRadioChange = (value: string): void => {
    if (value === "false" && dolEinError) {
      setDolEinError(false);
      setIsValid(true);
    }
    if (value === "false" && noAccountError) {
      setNoAccountError(false);
    }
    if (value === "false" && serverError) {
      setServerError(false);
    }
    setEmployerAccessRegistration(value);
    setProfileData((prev) => ({
      ...prev,
      employerAccessRegistration: value === "true",
      deptOfLaborEin: "",
    }));
  };

  const [loading, setLoading] = useState(false);
  const handleSubmit = async (event: MouseEvent<Element>): Promise<void> => {
    if (!userData) return;
    event.preventDefault();

    if (props.handleChangeOverride) {
      props.handleChangeOverride();
      return;
    }

    if (serverError) {
      setServerError(false);
    }

    let dolEinValue = state.profileData.deptOfLaborEin;
    if (!!dolEinValue && !isDolEinValid(dolEinValue)) {
      await decryptValue({
        encryptedValue: state.profileData.deptOfLaborEin,
      }).then((value) => {
        dolEinValue = value;
      });
    }

    if (!isDolEinValid(dolEinValue)) {
      setDolEinError(true);
      setIsValid(false);
      return;
    }

    updateQueue?.queueProfileData({ deptOfLaborEin: dolEinValue }).update();

    setLoading(true);
    const employerRates = {
      businessName: state.profileData.businessName,
      email: userData.user.email,
      ein: dolEinValue,
      qtr: props.quarter.quarter,
      year: props.quarter.year,
    } as EmployerRatesRequest;

    api
      .checkEmployerRates({ employerRates, userData })
      .then((results: EmployerRatesResponse) => {
        setLoading(false);
        if (results.error) {
          setNoAccountError(true);
          return;
        }
        props.setResponse(results);
      })
      .catch(() => {
        setServerError(true);
        setLoading(false);
      });
  };

  return (
    <div
      className={`${showEmployerAccessRadio ? "bg-base-extra-light padding-205 margin-top-3 radius-lg" : "padding-top-1 margin-top-3 radius-lg"}`}
    >
      <Heading level={4}>{Config.employerRates.employerAccessHeaderText}</Heading>

      {dolEinError && (
        <div className="margin-y-2">
          <Alert variant={"error"}>
            <div>{getProfileErrorAlertText(1)}</div>
            <li>
              <a href={`#question-dolEin`}>{Config.employerRates.dolEinAlertLabelText}</a>
            </li>
          </Alert>
        </div>
      )}

      {serverError && (
        <div className="margin-y-2">
          <Alert variant={"error"} dataTestid="serverError">
            <strong>
              <span>{Config.employerRates.serverErrorText}</span>
            </strong>

            <span>{Config.employerRates.serverErrorTryAgainText}</span>
          </Alert>
        </div>
      )}

      {noAccountError && (
        <div className="margin-y-2">
          <Alert variant={"error"} dataTestid="noAccountError">
            <strong>
              <Content>{Config.employerRates.noAccountErrorText}</Content>
            </strong>
          </Alert>
        </div>
      )}

      {showEmployerAccessRadio && (
        <>
          <Content>{Config.employerRates.employerAccessText}</Content>
          <FormControl fullWidth>
            <RadioGroup
              name="employerAccess"
              value={employerAccessRegistration}
              onChange={(event) => handleRadioChange(event.target.value)}
            >
              <FormControlLabel
                style={{ alignItems: "center" }}
                labelPlacement="end"
                value="true"
                control={<Radio color={"primary"} />}
                label={Config.employerRates.employerAccessTrueText}
              />

              <FormControlLabel
                style={{ alignItems: "center" }}
                labelPlacement="end"
                value="false"
                control={<Radio color={"primary"} />}
                label={Config.employerRates.employerAccessFalseText}
              />
            </RadioGroup>
          </FormControl>
        </>
      )}

      {shouldShowEmployerAccessInputFields && (
        <div role="status" aria-live="polite" className="margin-y-2">
          <WithErrorBar hasError={dolEinError} type="ALWAYS">
            <DolEin
              onValidation={(_, invalid) => {
                if (invalid && serverError) {
                  setServerError(false);
                }
                if (invalid && noAccountError) {
                  setNoAccountError(false);
                }
                setDolEinError(invalid);
                setIsValid(!invalid);
              }}
              handleChange={handleDolEinChange}
              value={state.profileData.deptOfLaborEin}
              error={dolEinError}
              validationText={Config.employerRates.dolEinErrorText}
              startHidden={state.profileData.deptOfLaborEin.length > 0}
              editable={showEmployerAccessRadio}
            />
          </WithErrorBar>
          <EmployerRatesQuarterDropdown
            dropdownOptions={dropdownOptions}
            quarter={props.quarter}
            setQuarter={props.setQuarter}
          />
          <SecondaryButton isColor="primary" onClick={handleSubmit} isLoading={loading}>
            {Config.employerRates.employerAccessYesButtonText}
          </SecondaryButton>
        </div>
      )}

      {shouldShowEmployerAccessRegistrationLink && (
        <>
          <div role="status" aria-live="polite" className="margin-bottom-2">
            <Content>{Config.employerRates.employerAccessNoBodyText}</Content>
          </div>
          <SecondaryButton
            isColor="primary"
            onClick={() => {
              window.open(
                Config.employerRates.employerAccessNoButtonLink,
                "_blank",
                "noopener,noreferrer",
              );
            }}
          >
            {Config.employerRates.employerAccessNoButtonText}
          </SecondaryButton>
        </>
      )}
    </div>
  );
};
