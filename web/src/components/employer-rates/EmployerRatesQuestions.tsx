import { ReactElement, useContext, useState } from "react";
import { Heading } from "../njwds-extended/Heading";
import { Content } from "@/components/Content";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { isUndefined } from "lodash";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { EmployerRatesQuarterDropdown } from "@/components/employer-rates/EmployerRatesQuarterDropdown";
import {
  EmployerRatesQuarterObject,
  getEmployerAccessQuarterlyDropdownOptions,
} from "@/lib/domain-logic/getEmployerAccessQuarterlyDropdownOptions";
import { getCurrentDate } from "@businessnjgovnavigator/shared/dateHelpers";

interface Props {
  CMS_ONLY_enable_preview?: boolean;
}

export const EmployerRatesQuestions = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { business } = useUserData();
  const { setProfileData } = useContext(ProfileDataContext);

  const employerAccessRegistrationValue = isUndefined(
    business?.profileData.employerAccessRegistration,
  )
    ? ""
    : String(business?.profileData.employerAccessRegistration);

  const [employerAccessRegistration, setEmployerAccessRegistration] = useState<string>(
    employerAccessRegistrationValue,
  );

  const employerAccessRegistrationIsTrue =
    employerAccessRegistration === "true" || props.CMS_ONLY_enable_preview;
  const employerAccessRegistrationIsFalse =
    employerAccessRegistration === "false" || props.CMS_ONLY_enable_preview;

  const dropdownOptions = getEmployerAccessQuarterlyDropdownOptions(getCurrentDate());
  const [quarter, setQuarter] = useState<EmployerRatesQuarterObject>(dropdownOptions[0]);

  return (
    <div className="bg-base-extra-light padding-205 margin-top-3 radius-lg">
      <Heading level={4}>{Config.employerRates.employerAccessHeaderText}</Heading>

      <Content>{Config.employerRates.employerAccessText}</Content>
      <FormControl fullWidth>
        <RadioGroup
          name="employerAccess"
          value={employerAccessRegistration}
          onChange={(event) => {
            const value = event.target.value;
            setEmployerAccessRegistration(value);
            setProfileData((prev) => ({
              ...prev,
              employerAccessRegistration: value === "true",
            }));
          }}
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
      {employerAccessRegistrationIsTrue && (
        <>
          <div role="status" aria-live="polite" className="margin-bottom-2">
            <EmployerRatesQuarterDropdown
              dropdownOptions={dropdownOptions}
              quarter={quarter}
              setQuarter={setQuarter}
            />
            <SecondaryButton isColor="primary" onClick={() => {}}>
              {Config.employerRates.employerAccessYesButtonText}
            </SecondaryButton>
          </div>
        </>
      )}
      {employerAccessRegistrationIsFalse && (
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
