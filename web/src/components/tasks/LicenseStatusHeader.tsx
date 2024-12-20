import { useConfig } from "@/lib/data-hooks/useConfig";
import { LicenseStatus } from "@businessnjgovnavigator/shared/license";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DangerousIcon from "@mui/icons-material/Dangerous";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import { ReactElement } from "react";

interface Props {
  licenseStatus: LicenseStatus;
}

type PermitColorScheme = {
  bgHdrColor: string;
  bgSubHdrColor: string;
  textAndIconColor: string;
  icon: ReactElement<any>;
};

export const LicenseStatusHeader = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();

  const permitColorScheme: Record<string, PermitColorScheme> = {
    activePermit: {
      bgHdrColor: "bg-success-dark",
      bgSubHdrColor: "bg-success-lighter",
      textAndIconColor: "text-primary-darker",
      icon: (
        <CheckCircleIcon className="display-none tablet:display-block tablet:margin-left-1 tablet:usa-icon--size-4" />
      ),
    },
    pendingPermit: {
      bgHdrColor: "bg-secondary",
      bgSubHdrColor: "bg-secondary-lighter",
      textAndIconColor: "text-secondary-darker",
      icon: (
        <WatchLaterIcon className="display-none tablet:display-block tablet:margin-left-1 tablet:usa-icon--size-4" />
      ),
    },
    inactivePermit: {
      bgHdrColor: "bg-error",
      bgSubHdrColor: "bg-error-extra-light",
      textAndIconColor: "text-error-darker",
      icon: (
        <DangerousIcon className="display-none tablet:display-block tablet:margin-left-1 tablet:usa-icon--size-4" />
      ),
    },
  };

  const getPermitColorScheme = (): PermitColorScheme => {
    if (props.licenseStatus === "ACTIVE") {
      return permitColorScheme["activePermit"];
    } else if (isPending(props.licenseStatus)) {
      return permitColorScheme["pendingPermit"];
    } else {
      return permitColorScheme["inactivePermit"];
    }
  };

  const isPending = (licenseStatus: LicenseStatus): boolean => {
    return pendingStatuses.has(licenseStatus);
  };

  const pendingStatuses: Set<LicenseStatus> = new Set([
    "PENDING",
    "DRAFT",
    "SUBMITTED",
    "UNDER_INTERNAL_REVIEW",
    "SPECIAL_REVIEW",
    "PENDING_DEFICIENCIES",
    "DEFICIENCIES_SUBMITTED",
    "CHECKLIST_COMPLETED",
    "APPROVED",
    "PENDING_RENEWAL",
    "PENDING_REINSTATEMENT",
  ]);

  const getText = (): string => {
    return LicenseStatusLookup[props.licenseStatus];
  };

  const LicenseStatusLookup: Record<LicenseStatus, string> = {
    ACTIVE: Config.licenseSearchTask.activePermitStatusText,
    PENDING: Config.licenseSearchTask.pendingPermitStatusText,
    EXPIRED: Config.licenseSearchTask.expiredPermitStatusText,
    BARRED: Config.licenseSearchTask.barredPermitStatusText,
    OUT_OF_BUSINESS: Config.licenseSearchTask.outOfBusinessPermitStatusText,
    REINSTATEMENT_PENDING: Config.licenseSearchTask.reinstatementPendingPermitStatusText,
    CLOSED: Config.licenseSearchTask.closedPermitStatusText,
    DELETED: Config.licenseSearchTask.deletedPermitStatusText,
    DENIED: Config.licenseSearchTask.deniedPermitStatusText,
    VOLUNTARY_SURRENDER: Config.licenseSearchTask.voluntarySurrenderPermitStatusText,
    WITHDRAWN: Config.licenseSearchTask.withdrawnPermitStatusText,
    UNKNOWN: "",
    DRAFT: Config.licenseSearchTask.draftStatusText,
    SUBMITTED: Config.licenseSearchTask.submittedStatusText,
    UNDER_INTERNAL_REVIEW: Config.licenseSearchTask.underInternalReviewStatusText,
    SPECIAL_REVIEW: Config.licenseSearchTask.specialReviewStatusText,
    PENDING_DEFICIENCIES: Config.licenseSearchTask.pendingDeficienciesStatusText,
    DEFICIENCIES_SUBMITTED: Config.licenseSearchTask.deficienciesSubmittedStatusText,
    CHECKLIST_COMPLETED: Config.licenseSearchTask.checklistCompletedStatusText,
    APPROVED: Config.licenseSearchTask.approvedStatusText,
    PENDING_RENEWAL: Config.licenseSearchTask.pendingRenewalStatusText,
    PENDING_REINSTATEMENT: Config.licenseSearchTask.pendingReinstatementStatusText,
    INACTIVE: Config.licenseSearchTask.inactiveStatusText,
    ABANDONED: Config.licenseSearchTask.abandonedStatusText,
    SUSPENDED: Config.licenseSearchTask.suspendedStatusText,
    REVOKED: Config.licenseSearchTask.revokedStatusText,
  };

  return (
    <div
      className={`text-bold fdc fac radius-lg ${getPermitColorScheme().bgSubHdrColor}`}
      data-testid={`permit-${props.licenseStatus}`}
    >
      <div
        className={`${
          getPermitColorScheme().bgHdrColor
        } text-white width-full radius-top-lg padding-y-1 padding-x-2 margin-0`}
      >
        {Config.licenseSearchTask.permitStatusText}
      </div>

      <div
        className={`padding-05 fdr fac radius-bottom-lg ${
          getPermitColorScheme().textAndIconColor
        } width-full font-sans-lg text-bold`}
      >
        {getPermitColorScheme().icon}

        <p className="tablet:margin-left-1 tablet:padding-05 padding-left-1 line-height-sans-3">
          {getText()}
        </p>
      </div>
    </div>
  );
};
