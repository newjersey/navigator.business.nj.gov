import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import type { XrayRegistrationStatus } from "@businessnjgovnavigator/shared/xray";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DangerousIcon from "@mui/icons-material/Dangerous";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import router from "next/router";
import { ReactElement } from "react";

interface Props {
  xrayRegistrationStatus: XrayRegistrationStatus;
  goToRegistrationTab: () => void;
}

type StatusColorScheme = {
  bgHdrColor: string;
  bgSubHdrColor: string;
  textAndIconColor: string;
  icon: ReactElement;
};

export const XrayStatusHeader = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const statusColorScheme: Record<XrayRegistrationStatus, StatusColorScheme> = {
    ACTIVE: {
      bgHdrColor: "bg-success-dark",
      bgSubHdrColor: "bg-success-lighter",
      textAndIconColor: "text-primary-darker",
      icon: (
        <CheckCircleIcon className="display-none tablet:display-block tablet:margin-left-1 tablet:usa-icon--size-8" />
      ),
    },
    EXPIRED: {
      bgHdrColor: "bg-error",
      bgSubHdrColor: "bg-error-extra-light",
      textAndIconColor: "text-error-darker",
      icon: (
        <WatchLaterIcon className="display-none tablet:display-block tablet:margin-left-1 tablet:usa-icon--size-8" />
      ),
    },
    INACTIVE: {
      bgHdrColor: "bg-secondary",
      bgSubHdrColor: "bg-secondary-lighter",
      textAndIconColor: "text-secondary-darker",
      icon: (
        <DangerousIcon className="display-none tablet:display-block tablet:margin-left-1 tablet:usa-icon--size-8" />
      ),
    },
  };

  const getTextByStatus: Record<XrayRegistrationStatus, { header: string; description: string }> = {
    ACTIVE: {
      header: Config.xrayRegistrationTask.activeStatusStatusText,
      description: Config.xrayRegistrationTask.activeDescription,
    },
    EXPIRED: {
      header: Config.xrayRegistrationTask.expiredStatusStatusText,
      description: Config.xrayRegistrationTask.expiredDescription,
    },
    INACTIVE: {
      header: Config.licenseSearchTask.inactiveStatusText,
      description: Config.xrayRegistrationTask.inactiveDescription,
    },
  };

  return (
    <div
      className={`fdc radius-lg ${statusColorScheme[props.xrayRegistrationStatus].bgSubHdrColor}`}
      data-testid={`status-${props.xrayRegistrationStatus}`}
    >
      <div
        className={`${
          statusColorScheme[props.xrayRegistrationStatus].bgHdrColor
        } text-white width-full radius-top-lg padding-y-05 padding-x-205 margin-0 text-bold`}
      >
        {Config.xrayRegistrationTask.registrationStatusText}
      </div>

      <div className="margin-205">
        <div
          className={`fdr fac  ${
            statusColorScheme[props.xrayRegistrationStatus].textAndIconColor
          } width-full font-sans-lg `}
        >
          {statusColorScheme[props.xrayRegistrationStatus].icon}

          <p className="text-bold tablet:margin-left-105 line-height-sans-4">
            {getTextByStatus[props.xrayRegistrationStatus].header}
          </p>
        </div>

        <div
          className={`tablet:padding-x-105 ${
            statusColorScheme[props.xrayRegistrationStatus].textAndIconColor
          }`}
        >
          {getTextByStatus[props.xrayRegistrationStatus].description}
          {props.xrayRegistrationStatus === "EXPIRED" && (
            <>
              <UnStyledButton
                isBgTransparent
                isUnderline
                isButtonALink
                isTextBold={false}
                className={`text-error-darker text-normal padding-0 margin-left-05`}
                onClick={() => {
                  analytics.event.xray_registration_expired_status_card.click.xray_renewal_started_expired_card();
                  router && router.push(Config.xrayRegistrationTask.renewRegistrationLink);
                }}
              >
                <span className="hover:text-error-dark text-underline">
                  {Config.xrayRegistrationTask.expiredDescriptionCallToAction}
                </span>
              </UnStyledButton>
            </>
          )}
          {props.xrayRegistrationStatus === "INACTIVE" && (
            <>
              <UnStyledButton
                isBgTransparent
                isUnderline
                isButtonALink
                isTextBold={false}
                className={`text-secondary-darker hover:text-secondary-dark text-normal text-align-left padding-0 margin-left-05`}
                onClick={props.goToRegistrationTab}
              >
                {Config.xrayRegistrationTask.inactiveDescriptionCallToAction}
              </UnStyledButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
