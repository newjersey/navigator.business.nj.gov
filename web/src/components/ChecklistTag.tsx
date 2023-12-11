import { Icon } from "@/components/njwds/Icon";
import { getMergedConfig } from "@/contexts/configContext";
import { CheckoffStatus } from "@businessnjgovnavigator/shared/license";
import { ReactElement } from "react";

interface Props {
  status: CheckoffStatus;
}

interface LicenseStatusMetadata {
  iconName: string;
  iconColor: string;
  statusText: string;
  statusTextColor: string;
  backgroundColor: string;
}

const Config = getMergedConfig();

export const statusObj: Record<CheckoffStatus, LicenseStatusMetadata> = {
  ACTIVE: {
    iconName: "check",
    iconColor: "text-success",
    statusText: Config.licenseSearchTask.completedStatusText,
    statusTextColor: "text-base-darkest",
    backgroundColor: "bg-base-lightest",
  },
  PENDING: {
    iconName: "schedule",
    iconColor: "text-base",
    statusText: Config.licenseSearchTask.pendingPermitStatusText,
    statusTextColor: "text-base-darkest",
    backgroundColor: "bg-base-lightest",
  },
  SCHEDULED: {
    iconName: "event",
    iconColor: "text-base",
    statusText: Config.licenseSearchTask.scheduledStatusText,
    statusTextColor: "text-base-darkest",
    backgroundColor: "bg-base-lightest",
  },
  INCOMPLETE: {
    iconName: "close",
    iconColor: "text-base",
    statusText: Config.licenseSearchTask.incompleteStatusText,
    statusTextColor: "text-base-darkest",
    backgroundColor: "bg-base-lightest",
  },
  NOT_APPLICABLE: {
    iconName: "do-not-disturb",
    iconColor: "text-base",
    statusText: Config.licenseSearchTask.notApplicableStatusText,
    statusTextColor: "text-base-darkest",
    backgroundColor: "bg-base-lightest",
  },
};

export const ChecklistTag = (props: Props): ReactElement => {
  const { iconName, iconColor, statusText, statusTextColor, backgroundColor } = statusObj[props.status];

  return (
    <div
      className={`${backgroundColor} flex flex-align-center padding-y-05 padding-left-1 padding-right-2 radius-md`}
    >
      <Icon className={`${iconColor} usa-icon--size-3`} data-testid={`${iconName}-checklist-tag-icon`}>
        {iconName}
      </Icon>
      <div className={`${statusTextColor} margin-left-1`}>{statusText}</div>
    </div>
  );
};
