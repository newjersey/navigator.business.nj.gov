import { useConfig } from "@/lib/data-hooks/useConfig";
import { XrayRegistrationStatus } from "@businessnjgovnavigator/shared/xray";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DangerousIcon from "@mui/icons-material/Dangerous";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import { ReactElement } from "react";

interface Props {
  xrayRegistrationStatus: XrayRegistrationStatus;
}

type StatusColorScheme = {
  bgHdrColor: string;
  bgSubHdrColor: string;
  textAndIconColor: string;
  icon: ReactElement;
};

export const XrayRegistrationStatusHeader = (props: Props): ReactElement => {
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
        } text-white width-full radius-top-lg padding-y-05 padding-x-2 margin-0`}
      >
        {Config.xrayRegistrationTask.registrationStatusText}
      </div>

      <div
        className={`fdr fac radius-bottom-lg ${
          statusColorScheme[props.xrayRegistrationStatus].textAndIconColor
        } width-full font-sans-lg padding-top-2 `}
      >
        {statusColorScheme[props.xrayRegistrationStatus].icon}

        <p className="text-bold tablet:margin-left-1 tablet:padding-left-1 line-height-sans-4">
          {getTextByStatus[props.xrayRegistrationStatus].header}
        </p>
      </div>

      <div className={"padding-x-2 padding-bottom-2"}>
        {getTextByStatus[props.xrayRegistrationStatus].description}
      </div>
    </div>
  );
};
