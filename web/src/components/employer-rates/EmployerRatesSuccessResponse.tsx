import { EmployerRatesSuccessTables } from "@/components/employer-rates/EmployerRatesSuccessTables";
import { Alert } from "@/components/njwds-extended/Alert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { templateEval } from "@/lib/utils/helpers";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { ReactElement, useContext } from "react";
import { EmployerRatesResponse } from "@businessnjgovnavigator/shared/employerRates";
import { EmployerRatesQuarterObject } from "@/lib/domain-logic/getEmployerAccessQuarterlyDropdownOptions";
import { Content } from "@/components/Content";
import { DolEin } from "@/components/data-fields/DolEin";
import { ProfileDataContext } from "@/contexts/profileDataContext";

interface Props {
  resetQuarter: () => void;
  response: EmployerRatesResponse;
  quarter: EmployerRatesQuarterObject;
}

export const EmployerRatesSuccessResponse = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);
  return (
    <>
      <Alert className={"margin-y-5"} variant={"success"}>
        <Content className={"inline-block"}>
          {templateEval(Config.employerRates.successAlertText, {
            quarterLabel: props.quarter.label,
          })}
        </Content>
        <UnStyledButton className={"padding-left-1"} onClick={props.resetQuarter} isUnderline>
          {Config.employerRates.editQuarterButtonText}
        </UnStyledButton>
      </Alert>
      <div className={"margin-y-5"}>
        <DolEin startHidden value={state.profileData.deptOfLaborEin} />
      </div>
      <EmployerRatesSuccessTables response={props.response} quarter={props.quarter} />
    </>
  );
};
