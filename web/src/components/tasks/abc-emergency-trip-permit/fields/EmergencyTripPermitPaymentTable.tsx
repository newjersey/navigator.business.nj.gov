import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getDollarValue } from "@/lib/utils/formatters";
import { ReactElement } from "react";

export const EmergencyTripPermitPaymentTable = (): ReactElement => {
  const { Config } = useConfig();

  return (
    <table className="emergency-trip-permit-billing">
      <thead>
        <tr>
          <th className="text-bold">{Config.formation.fields.paymentType.serviceColumnLabel}</th>
          <th className="text-bold">{Config.formation.fields.paymentType.costColumnLabel}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan={1}>
            <span>
              <span className={"padding-right-1"}>
                {Config.abcEmergencyTripPermit.steps.billing.tripPermitFeeLineItem}
              </span>
              <ArrowTooltip
                title={Config.abcEmergencyTripPermit.steps.billing.tripPermitFeeInfo}
                placement={"top"}
                data-testid="permit-fee-tooltip"
              >
                <span className="fac vam">
                  <Icon iconName="info_outline" />
                </span>
              </ArrowTooltip>
            </span>
          </td>
          <td colSpan={1} className={"text-bold text-secondary-vivid-dark"}>
            {getDollarValue(25)}
          </td>
        </tr>
        <tr>
          <td colSpan={1}>{Config.abcEmergencyTripPermit.steps.billing.onlineProcessFeeLineItem}</td>
          <td colSpan={1} className={"text-bold text-secondary-vivid-dark"}>
            {getDollarValue(5)}
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={1}>
            <div className="text-align-left">
              <span className="text-bold">
                {Config.abcEmergencyTripPermit.steps.billing.totalFeeLineItem}
              </span>
            </div>
          </td>
          <td colSpan={1}>
            <div className="text-align-right text-bold" aria-label="Subtotal">
              {getDollarValue(30)}
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  );
};
