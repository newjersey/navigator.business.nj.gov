import { ReactElement } from "react";
import { Heading } from "../njwds-extended/Heading";
import { EmployerRatesQuarterObject } from "@/lib/domain-logic/getEmployerAccessQuarterlyDropdownOptions";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { templateEval } from "@/lib/utils/helpers";
import { Content } from "@/components/Content";
import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Icon } from "@/components/njwds/Icon";
import { EmployerRatesResponse } from "@businessnjgovnavigator/shared/employerRates";

interface Props {
  response: EmployerRatesResponse;
  quarter: EmployerRatesQuarterObject;
}

const formatPercentage = (value: string): string => {
  return value ? `${value} %` : "";
};

const formatDollarAmount = (value: string): string => {
  const numVal = Number(value);
  return numVal ? `$ ${numVal.toLocaleString()}.00` : "";
};

export const EmployerRatesSuccessTables = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const response = props.response;

  return (
    <>
      <Heading level={3}>
        {templateEval(Config.employerRates.configRatesSuccessHeaderText, {
          quarterLabel: props.quarter.label,
        })}
      </Heading>
      <table
        aria-label={"Quarterly Contribution Rates"}
        className={"employer-rates-success-table employer-rates-quarterly-table margin-y-5"}
      >
        <thead>
          <tr>
            <th></th>
            <th>{Config.employerRates.workerRatesTableHeaderText}</th>
            <th>{Config.employerRates.employerRatesTableHeaderText}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Content>{Config.employerRates.unemploymentInsuranceRow}</Content>
            </td>
            <td>{formatPercentage(response.workerUiRate)}</td>
            <td>{formatPercentage(response.employerUiRate)}</td>
          </tr>
          <tr>
            <td>
              <Content>{Config.employerRates.disabilityInsuranceRow}</Content>
            </td>
            <td>{formatPercentage(response.workerDiRate)}</td>
            <td>{formatPercentage(response.employerDiRate)}</td>
          </tr>
          <tr>
            <td>
              <Content>{Config.employerRates.workforceDevelopmentRow}</Content>
            </td>
            <td>{formatPercentage(response.workerWfRate)}</td>
            <td>{formatPercentage(response.employerWfRate)}</td>
          </tr>
          <tr>
            <td className={"healthcare-subsidy-fund"}>
              <span className={"margin-right-1"}>
                {Config.employerRates.healthcareSubsidyFundRow}
              </span>
              <span>
                <ArrowTooltip title={Config.employerRates.healthcareSubsidyFundTooltipText}>
                  <span className="inline-block">
                    <Icon iconName="help_outline" />
                  </span>
                </ArrowTooltip>
              </span>
            </td>
            <td>{formatPercentage(response.workerHcRate)}</td>
            <td>{formatPercentage(response.employerHcRate)}</td>
          </tr>
          <tr>
            <td>
              <Content>{Config.employerRates.familyLeaveInsuranceRow}</Content>
            </td>
            <td>{formatPercentage(response.workerFliRate)}</td>
            <td>{Config.employerRates.noEmployerRatesFliText}</td>
          </tr>
        </tbody>
      </table>
      <br />

      <Heading level={3}>{Config.employerRates.totalContributionsSuccessHeaderText}</Heading>
      <table
        aria-label={"Total Contribution Rates"}
        className={"employer-rates-success-table employer-rates-total-table margin-y-5"}
      >
        <tbody>
          <tr>
            <td>
              <strong>
                <Content>{Config.employerRates.uiHcWFLabelText}</Content>
              </strong>
            </td>
            <td colSpan={2}>{response.TotalUiHcWf}</td>
          </tr>
          <tr>
            <td>
              <strong>
                <Content>{Config.employerRates.diLabelText}</Content>
              </strong>
            </td>
            <td colSpan={2}>{response.totalDi}</td>
          </tr>
          <tr>
            <td>
              <strong>
                <Content>{Config.employerRates.fliLabelText}</Content>
              </strong>
            </td>
            <td colSpan={2}>{response.TotalFli}</td>
          </tr>
          <tr>
            <td>
              <strong>
                <Content>{Config.employerRates.taxableWageBaseLabelText}</Content>
              </strong>
            </td>
            <td colSpan={2}>{formatDollarAmount(response.taxableWageBase)}</td>
          </tr>
          <tr>
            <td>
              <strong>
                <Content>{Config.employerRates.taxableWageBaseDiFliLabelText}</Content>
              </strong>
            </td>
            <td colSpan={2}>{formatDollarAmount(response.taxableWageBaseDiFli)}</td>
          </tr>
          <tr>
            <td>
              <strong>
                <Content>{Config.employerRates.baseWeekAmountLabelText}</Content>
              </strong>
            </td>
            <td colSpan={2}>{formatDollarAmount(response.baseWeekAmt)}</td>
          </tr>
          <tr>
            <td>
              <strong>
                <Content>{Config.employerRates.numberOfBaseWeeksLabelText}</Content>
              </strong>
            </td>
            <td colSpan={2}>{response.numberOfBaseWeeks}</td>
          </tr>
        </tbody>
      </table>
    </>
  );
};
