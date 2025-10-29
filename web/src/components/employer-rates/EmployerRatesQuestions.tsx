import type { MouseEvent } from "react";
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
import { GenericTextField } from "@/components/GenericTextField";
import { ScrollableFormFieldWrapper } from "@/components/data-fields/ScrollableFormFieldWrapper";
import { WithErrorBar } from "@/components/WithErrorBar";
import { getProfileErrorAlertText } from "@/components/profile/getProfileErrorAlertText";
import { Alert } from "@/components/njwds-extended/Alert";
import * as api from "@/lib/api-client/apiClient";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { EmployerRatesRequest } from "@businessnjgovnavigator/shared";

interface Props {
  CMS_ONLY_enable_preview?: boolean;
}

export const DOL_EIN_CHARACTERS = 15;

export const EmployerRatesQuestions = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { userData } = useUserData();

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
  const [quarter, setQuarter] = useState<EmployerRatesQuarterObject>(dropdownOptions[0]);

  const [dolEinError, setDolEinError] = useState<boolean>(previewMode || false);
  const [serverError, setServerError] = useState<boolean>(previewMode || false);

  const handleDolEinChange = (value: string): void => {
    setProfileData((prev) => ({
      ...prev,
      deptOfLaborEin: value,
    }));
  };

  const isDolEinValid = (value: string): boolean => value.length === DOL_EIN_CHARACTERS;

  const handleRadioChange = (value: string): void => {
    if (value === "false" && dolEinError) {
      setDolEinError(false);
    }
    setServerError(false);
    setEmployerAccessRegistration(value);
    setProfileData((prev) => ({
      ...prev,
      employerAccessRegistration: value === "true",
    }));
  };

  const [loading, setLoading] = useState(false);
  const handleSubmit = (event: MouseEvent<Element>): void => {
    if (!userData) return;
    event.preventDefault();

    if (serverError) {
      setServerError(false);
    }

    if (!isDolEinValid(state.profileData.deptOfLaborEin)) {
      setDolEinError(true);
      return;
    }

    setLoading(true);
    const employerRates = {
      businessName: state.profileData.businessName,
      email: userData.user.email,
      ein: state.profileData.deptOfLaborEin,
      qtr: quarter.quarter,
      year: quarter.year,
    } as EmployerRatesRequest;

    api
      .checkEmployerRates({ employerRates, userData })
      //   .then((results) => {
      //     setLoading(false);
      //   })
      .catch(() => {
        setServerError(true);
        setLoading(false);
      });
  };

  return (
    <div className="bg-base-extra-light padding-205 margin-top-3 radius-lg">
      <Heading level={4}>{Config.employerRates.employerAccessHeaderText}</Heading>

      {dolEinError && (
        <div role="status" aria-live="polite" className="margin-y-2">
          <Alert variant={"error"}>
            <div>{getProfileErrorAlertText(1)}</div>
            <li>
              <a href={`#question-dolEin`}>{Config.employerRates.dolEinAlertLabelText}</a>
            </li>
          </Alert>
        </div>
      )}

      {serverError && (
        <div role="status" aria-live="polite" className="margin-y-2">
          <Alert variant={"error"} dataTestid="serverError">
            <Content>{Config.employerRates.serverErrorText}</Content>
          </Alert>
        </div>
      )}

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

      {shouldShowEmployerAccessInputFields && (
        <div role="status" aria-live="polite" className="margin-y-2">
          <WithErrorBar hasError={dolEinError} type="ALWAYS">
            <Content>{Config.employerRates.dolEinLabelText}</Content>

            <ScrollableFormFieldWrapper fieldName={"dolEin"}>
              <div className="text-field-width-reduced">
                <GenericTextField
                  numericProps={{
                    maxLength: DOL_EIN_CHARACTERS,
                  }}
                  fieldName={"dolEin"}
                  inputWidth={"default"}
                  error={dolEinError}
                  validationText={Config.employerRates.dolEinErrorText}
                  onChange={handleDolEinChange}
                  onValidation={(_, invalid) => {
                    if (invalid && serverError) {
                      setServerError(false);
                    }
                    setDolEinError(invalid);
                  }}
                  value={state.profileData.deptOfLaborEin}
                />
              </div>
            </ScrollableFormFieldWrapper>
          </WithErrorBar>
          <EmployerRatesQuarterDropdown
            dropdownOptions={dropdownOptions}
            quarter={quarter}
            setQuarter={setQuarter}
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
