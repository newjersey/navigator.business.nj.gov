import { HorizontalLine } from "@/components/HorizontalLine";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { ResultsSectionAccordion } from "@/components/tasks/environment-questionnaire/results/ResultsSectionAccordion";
import { XrayRegistrationStatusHeader } from "@/components/tasks/XrayRegistrationStatusHeader";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getCurrentDate } from "@businessnjgovnavigator/shared/dateHelpers";
import { XrayData, XrayRegistrationStatus } from "@businessnjgovnavigator/shared/xray";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { ReactElement } from "react";

interface Props {
  xrayRegistrationData: XrayData;
  edit: () => void;
}

type StatusColorScheme = {
  iconBackground: string;
  iconColor: string;
};

const statusColorScheme: Record<XrayRegistrationStatus, StatusColorScheme> = {
  ACTIVE: {
    iconBackground: "bg-success-lighter",
    iconColor: "text-primary-darker",
  },
  EXPIRED: {
    iconBackground: "bg-error-extra-light",
    iconColor: "text-error-darker",
  },
  INACTIVE: {
    iconBackground: "bg-secondary-lighter",
    iconColor: "text-secondary-darker",
  },
};

const getFormatedExpirationDate = (expirationDate: string): string => {
  dayjs.extend(localizedFormat);
  if (dayjs(expirationDate).diff(getCurrentDate(), "day") <= 30) {
    const daysToExpiration = dayjs(expirationDate).diff(getCurrentDate(), "day");
    return `Expires in ${daysToExpiration} days (${dayjs(expirationDate).format("LL")})`;
  } else if (dayjs(expirationDate) < getCurrentDate()) {
    return `Expired on ${dayjs(expirationDate).format("LL")}`;
  } else {
    return `Expires on ${dayjs(expirationDate).format("LL")}`;
  }
};

export const XrayRegistrationSummary = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const xrayData = props.xrayRegistrationData;
  if (!xrayData) return <></>;
  return (
    <div
      data-testid={"xray-registration-summary"}
      className={"bg-base-extra-light fdc fg1 padding-2 radius-lg drop-shadow-xs"}
    >
      <div className={"font-open-sans-5 margin-bottom-3"}>
        <div className={"text-bold"}>{xrayData.facilityDetails.businessName}</div>
        <div className={"display-flex"}>
          <div className="margin-right-1">{`${xrayData.facilityDetails.addressLine1}, ${xrayData.facilityDetails.addressZipCode} NJ`}</div>
          <UnStyledButton isUnderline onClick={props.edit}>
            {Config.xrayRegistrationTask.editButtonText}
          </UnStyledButton>
        </div>
      </div>
      <div className={"paper"}>
        <XrayRegistrationStatusHeader xrayRegistrationStatus={xrayData.status} />
        <HorizontalLine />
        <div className={`fdr radius-bottom-lg`}>
          <Icon
            iconName={"event"}
            className={`${statusColorScheme[xrayData.status].iconColor} ${
              statusColorScheme[xrayData.status].iconBackground
            }  height-3 width-3 padding-05 bg-error-extra-light radius-pill margin-right-1`}
          />
          <span className="font-open-sans-7">{getFormatedExpirationDate(xrayData.expirationDate)}</span>
        </div>
        <HorizontalLine customMargin={"margin-top-2"} />
        {/* TODO Replace with Config */}
        <ResultsSectionAccordion
          title={"Equipment"}
          headingStyleOverride={"font-open-sans-7"}
          summaryClass={"height-5"}
          titleIcon={
            <Icon
              iconName={"build"}
              className={`${statusColorScheme[xrayData.status].iconColor} ${
                statusColorScheme[xrayData.status].iconBackground
              }  height-3 width-3 padding-05 bg-error-extra-light radius-pill margin-right-1`}
            />
          }
        >
          <div className="margin-top-1 font-open-sans-5">
            {xrayData.machines.map((machine) => {
              return (
                <div key={machine.name}>
                  <div className="text-bold">{machine.name}</div>
                  <ul>
                    <li>{`Registration Number: ${machine.registrationNumber}`}</li>
                    <li>{`Room ID: ${machine.roomId}`}</li>
                    <li>{`Registration Category: ${machine.registrationCategory}`}</li>
                    <li>{`Manufacturer: ${machine.manufacturer}`}</li>
                    <li>{`Model Number: ${machine.modelNumber}`}</li>
                    <li>{`Serial Number: ${machine.serialNumber}`}</li>
                    <li>{`Annual Fee: $${machine.annualFee}`}</li>
                  </ul>
                </div>
              );
            })}
          </div>
        </ResultsSectionAccordion>
      </div>
      {/* TODO Replace with Config */}
      <div className={"font-open-sans-3 margin-top-2"}>
        <span className={"text-bold"}>Issuing Agency:</span> Department of Environmental Protection
      </div>
    </div>
  );
};
