import { HorizontalLine } from "@/components/HorizontalLine";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { ResultsSectionAccordion } from "@/components/ResultsSectionAccordion";
import { XrayStatusHeader } from "@/components/xray/XrayStatusHeader";

import { useConfig } from "@/lib/data-hooks/useConfig";
import { templateEval } from "@/lib/utils/helpers";
import { ConfigType } from "@businessnjgovnavigator/shared/contexts";
import { getCurrentDate } from "@businessnjgovnavigator/shared/dateHelpers";
import type { XrayData, XrayRegistrationStatus } from "@businessnjgovnavigator/shared/xray";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { ReactElement } from "react";

interface Props {
  xrayRegistrationData: XrayData;
  edit: () => void;
  goToRegistrationTab: () => void;
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

const getFormatedExpirationDate = (Config: ConfigType, expirationDate: string): string => {
  dayjs.extend(localizedFormat);
  const daysToExpiration = dayjs(expirationDate).diff(getCurrentDate(), "day");
  if (daysToExpiration <= 30 && daysToExpiration >= 0) {
    return templateEval(Config.xrayRegistrationTask.expiresInLessThanAMonthText, {
      daysToExpiration: daysToExpiration as unknown as string,
      futureDate: dayjs(expirationDate).format("LL"),
    });
  } else if (dayjs(expirationDate) < getCurrentDate()) {
    return templateEval(Config.xrayRegistrationTask.expiredText, {
      pastDate: dayjs(expirationDate).format("LL"),
    });
  } else {
    return templateEval(Config.xrayRegistrationTask.futureExpirationDateText, {
      futureDate: dayjs(expirationDate).format("LL"),
    });
  }
};

export const XraySummary = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const xrayData = props.xrayRegistrationData;
  if (!xrayData.facilityDetails || !xrayData.status || !xrayData.machines) return <></>;
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
        <XrayStatusHeader
          xrayRegistrationStatus={xrayData.status}
          goToRegistrationTab={props.goToRegistrationTab}
        />
        <HorizontalLine />
        <div className={`fdr radius-bottom-lg`}>
          <Icon
            iconName={"event"}
            className={`${statusColorScheme[xrayData.status]?.iconColor} ${
              statusColorScheme[xrayData.status].iconBackground
            }  height-3 width-3 padding-5px bg-error-extra-light radius-pill margin-right-1`}
          />
          <span className="font-open-sans-7">
            {getFormatedExpirationDate(Config, xrayData.expirationDate ?? "")}
          </span>
        </div>
        <HorizontalLine customMargin={"margin-top-2"} />
        <ResultsSectionAccordion
          title={Config.xrayRegistrationTask.equipmentText}
          headingStyleOverride={"font-open-sans-7"}
          titleIcon={
            <Icon
              iconName={"build"}
              className={`${statusColorScheme[xrayData.status].iconColor} ${
                statusColorScheme[xrayData.status].iconBackground
              }  height-3 width-3 padding-5px bg-error-extra-light radius-pill margin-right-1`}
            />
          }
        >
          <div className="margin-top-1 font-open-sans-5">
            {xrayData.machines.map((machine) => {
              return (
                <div key={machine.name}>
                  <div className="text-bold">{machine.name}</div>
                  <ul>
                    <li>
                      {templateEval(Config.xrayRegistrationTask.registrationNumber, {
                        registrationNumber:
                          machine.registrationNumber ??
                          Config.xrayRegistrationTask.noInformationAvailable,
                      })}
                    </li>
                    <li>
                      {templateEval(Config.xrayRegistrationTask.roomId, {
                        roomId:
                          machine.roomId ?? Config.xrayRegistrationTask.noInformationAvailable,
                      })}
                    </li>
                    <li>
                      {templateEval(Config.xrayRegistrationTask.registrationCategory, {
                        registrationCategory:
                          machine.registrationCategory ??
                          Config.xrayRegistrationTask.noInformationAvailable,
                      })}
                    </li>
                    <li>
                      {templateEval(Config.xrayRegistrationTask.modelNumber, {
                        modelNumber:
                          machine.modelNumber ?? Config.xrayRegistrationTask.noInformationAvailable,
                      })}
                    </li>
                    <li>
                      {templateEval(Config.xrayRegistrationTask.serialNumber, {
                        serialNumber:
                          machine.serialNumber ??
                          Config.xrayRegistrationTask.noInformationAvailable,
                      })}
                    </li>
                    <li>
                      {templateEval(Config.xrayRegistrationTask.annualFee, {
                        annualFee: machine.annualFee
                          ? `$${machine.annualFee?.toString()}`
                          : Config.xrayRegistrationTask.noInformationAvailable,
                      })}
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>
        </ResultsSectionAccordion>
      </div>
      <div className={" font-body-2xs margin-top-2"}>
        <span className={"text-bold margin-right-05"}>
          {Config.xrayRegistrationTask.issuingAgencyText}:
        </span>
        {Config.xrayRegistrationTask.issuingAgency}
      </div>
      {xrayData && (
        <div className={"text-base-dark text-italic font-body-2xs"}>
          {templateEval(Config.xrayRegistrationTask.lastUpdatedText, {
            lastUpdatedFormattedValue: dayjs(xrayData.lastUpdatedISO).format(
              "MMMM Do, YYYY [at] ha",
            ),
          })}
        </div>
      )}
    </div>
  );
};
