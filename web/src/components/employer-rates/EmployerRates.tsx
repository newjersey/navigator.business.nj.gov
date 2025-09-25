import { useUserData } from "@/lib/data-hooks/useUserData";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/";
import { ReactElement, useState } from "react";
import { Heading } from "../njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { Content } from "@/components/Content";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";

export const EmployerRates = (): ReactElement => {
  const { business } = useUserData();
  const { Config } = useConfig();
  const [employerAccessRadio, setEmployerAccessRadio] = useState<string>("");
  const operatingPhase = LookupOperatingPhaseById(business?.profileData.operatingPhase);

  if (!operatingPhase.displayEmployerRatesInProfile) {
    return <></>;
  }

  return (
    <>
      <div className="margin-top-5 margin-bottom-10">
        <Heading level={3}>{Config.employerRates.sectionHeaderText}</Heading>
        <Content>{Config.employerRates.belowSectionHeaderText}</Content>

        <div className="bg-base-extra-light padding-205 margin-top-3 radius-lg">
          <Heading level={2}>{Config.employerRates.employerAccessHeaderText}</Heading>

          <Content>{Config.employerRates.employerAccessText}</Content>
          <FormControl fullWidth>
            <RadioGroup
              aria-label="aria-label-attribute"
              name="name-attribute"
              value={employerAccessRadio}
              onChange={(event) => {
                setEmployerAccessRadio(event.target.value);
              }}
            >
              <FormControlLabel
                aria-label="aria-label-attribute"
                style={{ alignItems: "center" }}
                labelPlacement="end"
                value="true"
                control={<Radio color={"primary"} />}
                label={Config.employerRates.employerAccessTrueText}
              />

              <FormControlLabel
                aria-label="aria-label-attribute"
                style={{ alignItems: "center" }}
                labelPlacement="end"
                value="false"
                control={<Radio color={"primary"} />}
                label={Config.employerRates.employerAccessFalseText}
              />
            </RadioGroup>
          </FormControl>
        </div>
      </div>
    </>
  );
};
