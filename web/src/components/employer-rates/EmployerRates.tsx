import {
  EmployerRatesResponse,
  getCurrentDate,
  LookupOperatingPhaseById,
} from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext, useState } from "react";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { Content } from "@/components/Content";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { EmployerRatesSuccessResponse } from "@/components/employer-rates/EmployerRatesSuccessResponse";
import {
  EmployerRatesQuarterObject,
  getEmployerAccessQuarterlyDropdownOptions,
} from "@/lib/domain-logic/getEmployerAccessQuarterlyDropdownOptions";
import { EmployerRatesQuestions } from "@/components/employer-rates/EmployerRatesQuestions";
import { Heading } from "@/components/njwds-extended/Heading";

interface Props {
  CMS_ONLY_enable_preview?: boolean;
  handleChangeOverride?: (() => void) | undefined;
}

export const EmployerRates = (props: Props): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  const { Config } = useConfig();
  const operatingPhase = LookupOperatingPhaseById(state.profileData.operatingPhase);
  const dropdownOptions = getEmployerAccessQuarterlyDropdownOptions(getCurrentDate());
  const [quarter, setQuarter] = useState<EmployerRatesQuarterObject>(dropdownOptions[0]);
  const [response, setResponse] = useState<EmployerRatesResponse | false>(false);
  const FEATURE_EMPLOYER_RATES_ENABLED = process.env.FEATURE_EMPLOYER_RATES === "true";

  if (
    !operatingPhase.displayEmployerRatesInProfile &&
    !props.CMS_ONLY_enable_preview &&
    !FEATURE_EMPLOYER_RATES_ENABLED
  ) {
    return <></>;
  }

  return (
    <>
      <div className="margin-top-5 margin-bottom-10" data-testid={"employerAccess"}>
        <Heading level={3}>{Config.employerRates.sectionHeaderText}</Heading>
        <Content>{Config.employerRates.belowSectionHeaderText}</Content>

        {!response && (
          <EmployerRatesQuestions
            quarter={quarter}
            setQuarter={setQuarter}
            setResponse={setResponse}
            CMS_ONLY_enable_preview={props.CMS_ONLY_enable_preview}
            handleChangeOverride={props.handleChangeOverride}
          />
        )}

        {response && (
          <EmployerRatesSuccessResponse
            response={response}
            quarter={quarter}
            resetQuarter={() => {
              setResponse(false);
            }}
          />
        )}
      </div>
    </>
  );
};
