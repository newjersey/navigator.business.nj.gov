import { ChecklistTag } from "@/components/ChecklistTag";
import { HorizontalLine } from "@/components/HorizontalLine";
import { Heading } from "@/components/njwds-extended/Heading";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { getMergedConfig } from "@/contexts/configContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import {
  LicenseDetails,
  LicenseStatus,
  LicenseStatusItem,
  LicenseTaskID,
  taskIdLicenseNameMapping,
} from "@businessnjgovnavigator/shared/";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DangerousIcon from "@mui/icons-material/Dangerous";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import type { ReactElement } from "react";

interface Props {
  licenseDetails: LicenseDetails;
  onEdit: () => void;
  licenseTaskId: LicenseTaskID;
}

type PermitColorScheme = {
  bgHdrColor: string;
  bgSubHdrColor: string;
  textAndIconColor: string;
  icon: ReactElement;
};

const Config = getMergedConfig();

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

const isPending = (licenseStatus: LicenseStatus): boolean => {
  return pendingStatuses.has(licenseStatus);
};

export const LicenseDetailReceipt = (props: Props): ReactElement => {
  const { business } = useUserData();

  const getPermitColorScheme = (): PermitColorScheme => {
    if (props.licenseDetails.licenseStatus === "ACTIVE") {
      return permitColorScheme["activePermit"];
    } else if (isPending(props.licenseDetails.licenseStatus)) {
      return permitColorScheme["pendingPermit"];
    } else {
      return permitColorScheme["inactivePermit"];
    }
  };

  const getText = (): string => {
    return LicenseStatusLookup[props.licenseDetails.licenseStatus];
  };

  const getOneLineAddress = (): string => {
    const nameAndAddress =
      business?.licenseData?.licenses?.[taskIdLicenseNameMapping[props.licenseTaskId]]?.nameAndAddress;
    if (!nameAndAddress) {
      return "";
    }
    const secondLineAddress = nameAndAddress.addressLine2 ? ` ${nameAndAddress.addressLine2}` : "";
    return `${nameAndAddress.addressLine1}${secondLineAddress}, ${nameAndAddress.zipCode} NJ`;
  };

  const receiptItem = (item: LicenseStatusItem, index: number): ReactElement => {
    return (
      <div key={index} data-testid={`item-${item.status}`}>
        <div
          className={`flex flex-column fac tablet-flex-row width-full ${
            index === 0 ? "" : "border-top-1px padding-top-2 tablet:padding-top-05"
          }  border-base-lightest padding-bottom-2 tablet:padding-bottom-05`}
        >
          <ChecklistTag status={item.status} />
          <span className="tablet:margin-left-2 text-left width-full">{item.title}</span>
        </div>
      </div>
    );
  };

  return (
    <div data-testid="licenseDetailReceipt" className="fdc fg1 overflow-y-hidden margin-top-3">
      <p className="margin-x-3 margin-bottom-3">{Config.licenseSearchTask.foundText}</p>

      <div className="border-2px border-base-lightest radius-lg bg-base-extra-light text-base-darkest padding-x-2 padding-y-205 width-full tablet:padding-x-5 tablet:padding-y-4">
        <div className="flex flex-column tablet-flex-row tablet-flex-alignItems-end">
          <div>
            <div className="text-bold">
              {business?.licenseData?.licenses?.[
                taskIdLicenseNameMapping[props.licenseTaskId]
              ]?.nameAndAddress.name.toUpperCase()}
            </div>
            {getOneLineAddress()}
          </div>
          <div>
            <UnStyledButton
              className="tablet:margin-left-1"
              isUnderline={true}
              dataTestid="edit-button"
              onClick={(): void => {
                analytics.event.task_status_checklist_edit_button.click.edit_address_form();
                props.onEdit();
              }}
            >
              {Config.licenseSearchTask.editButtonText}
            </UnStyledButton>
          </div>
        </div>

        <div className="border-2px border-white radius-lg bg-white padding-y-2 padding-x-105 margin-bottom-2 margin-top-205 shadow-3">
          <div
            className={`margin-1 text-bold fdc fac radius-lg ${getPermitColorScheme().bgSubHdrColor}`}
            data-testid={`permit-${props.licenseDetails.licenseStatus}`}
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
          <div className="padding-2">
            <Heading
              level={2}
              styleVariant="h4"
              className="margin-bottom-1 tablet:padding-top-1 border-bottom-2px border-base-lightest padding-bottom-1"
            >
              {Config.licenseSearchTask.applicationChecklistItemsText}
            </Heading>
            {props.licenseDetails.checklistItems.map(receiptItem)}
          </div>
        </div>
        <HorizontalLine />
        <div>
          <div className="h5-styling">{Config.taskDefaults.issuingAgencyText}: </div>
          <div className="h6-styling">{Config.licenseSearchTask.issuingAgencyNameText}</div>
        </div>
      </div>
    </div>
  );
};
