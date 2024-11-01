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
  backgroundColor: string;
}

const Config = getMergedConfig();

export const statusObj: Record<CheckoffStatus, LicenseStatusMetadata> = {
  ACTIVE: {
    iconName: "check",
    iconColor: "text-success",
    statusText: Config.licenseSearchTask.completedStatusText,
    backgroundColor: "bg-base-lightest",
  },
  PENDING: {
    iconName: "schedule",
    iconColor: "text-base",
    statusText: Config.licenseSearchTask.pendingPermitStatusText,
    backgroundColor: "bg-base-lightest",
  },
  SCHEDULED: {
    iconName: "event",
    iconColor: "text-base",
    statusText: Config.licenseSearchTask.scheduledStatusText,
    backgroundColor: "bg-base-lightest",
  },
  INCOMPLETE: {
    iconName: "close",
    iconColor: "text-base",
    statusText: Config.licenseSearchTask.incompleteStatusText,
    backgroundColor: "bg-base-lightest",
  },
  NOT_APPLICABLE: {
    iconName: "do-not-disturb",
    iconColor: "text-base",
    statusText: Config.licenseSearchTask.notApplicableStatusText,
    backgroundColor: "bg-base-lightest",
  },
};

export const ChecklistTag = (props: Props): ReactElement => {
  const { iconName, iconColor, statusText, backgroundColor } = statusObj[props.status];

  return (
    <div
      className={`${backgroundColor} flex flex-align-items-center padding-y-05 padding-left-1 padding-right-2 radius-md width-full tablet:width-auto`}
    >
      <Icon
        className={`${iconColor} usa-icon--size-3`}
        data-testid={`${iconName}-checklist-tag-icon`}
        iconName={iconName}
      />
      <div className="text-base-darkest margin-left-1">{statusText}</div>
    </div>
  );
};
