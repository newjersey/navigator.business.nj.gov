import { ChecklistTag } from "@/components/ChecklistTag";
import { HorizontalLine } from "@/components/HorizontalLine";
import { Heading } from "@/components/njwds-extended/Heading";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { getMergedConfig } from "@/contexts/configContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { getTaskAgencyText } from "@/lib/utils/helpers";
import { LicenseStatus, LicenseStatusItem } from "@businessnjgovnavigator/shared/";
import { ReactElement, useEffect, useState } from "react";

interface Props {
  items: LicenseStatusItem[];
  status: LicenseStatus;
  agency: string;
  context?: string;
  onEdit: () => void;
}

type PermitTheme = {
  bgHdrColor: string;
  bgSubHdrColor: string;
  textAndIconColor: string;
};

const Config = getMergedConfig();

const activePermitTheme: PermitTheme = {
  bgHdrColor: "bg-success-dark",
  bgSubHdrColor: "bg-success-lighter",
  textAndIconColor: "text-primary-darker",
};

const inactivePermitTheme: PermitTheme = {
  bgHdrColor: "bg-error",
  bgSubHdrColor: "bg-error-extra-light",
  textAndIconColor: "text-error-darker",
};

const pendingPermitTheme: PermitTheme = {
  bgHdrColor: "bg-secondary",
  bgSubHdrColor: "bg-secondary-lighter",
  textAndIconColor: "text-secondary-darker",
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

export const LicenseStatusReceipt = (props: Props): ReactElement => {
  const [permitColorScheme, setPermitColorTheme] = useState<PermitTheme>(pendingPermitTheme);
  const { business } = useUserData();

  useEffect(() => {
    if (props.status === "ACTIVE") {
      setPermitColorTheme(activePermitTheme);
    } else if (isPending(props.status)) {
      setPermitColorTheme(pendingPermitTheme);
    } else {
      setPermitColorTheme(inactivePermitTheme);
    }
  }, [props.status]);

  const getText = (): string => {
    return LicenseStatusLookup[props.status];
  };

  const getIcon = (status: LicenseStatus): string => {
    if (status === "ACTIVE") {
      return "check_circle_outline";
    } else if (isPending(props.status)) {
      return "schedule";
    } else {
      return "highlight_off";
    }
  };

  const getOneLineAddress = (): string => {
    if (!business || !business.licenseData) {
      return "";
    }
    const { nameAndAddress } = business.licenseData;
    const secondLineAddress = nameAndAddress.addressLine2 ? ` ${nameAndAddress.addressLine2}` : "";
    return `${nameAndAddress.addressLine1}${secondLineAddress}, ${nameAndAddress.zipCode} NJ`;
  };

  const receiptItem = (
    item: LicenseStatusItem,
    index: number,
    receiptItems: LicenseStatusItem[]
  ): ReactElement => {
    return (
      <div key={index} data-testid={`item-${item.status}`}>
        <div className="flex flex-column fac tablet-flex-row width-full pt-1 tpt-0">
          <ChecklistTag status={item.status} />
          <span className="margin-left-2 text-left width-full margin-top-1 tablet:margin-top-0">
            {item.title}
          </span>
        </div>
        {index === receiptItems.length - 1 ? <></> : <hr className="desktop:margin-bottom-1" />}
      </div>
    );
  };

  return (
    <div className="fdc fg1 overflow-y-hidden margin-top-3">
      <p className="margin-x-3 margin-bottom-3">{Config.licenseSearchTask.foundText}</p>

      <div className="border-2px border-base-lightest radius-lg bg-base-extra-light text-base-darkest padding-x-5 padding-y-4 width-full">
        <div className="flex flex-column tablet-flex-row tablet-flex-alignItems-end">
          <div>
            <div className="text-bold">{business?.licenseData?.nameAndAddress.name.toUpperCase()}</div>
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

        <div className="border-2px border-white radius-lg bg-white padding-y-2 padding-x-105 margin-bottom-5 margin-top-205 shadow-3">
          <div
            className={`margin-1 text-bold fdc fac radius-lg ${permitColorScheme.bgSubHdrColor}`}
            data-testid={`permit-${props.status}`}
          >
            <div
              className={`${permitColorScheme.bgHdrColor} text-white width-full radius-top-lg padding-y-1 padding-x-2 margin-0`}
            >
              {Config.licenseSearchTask.permitStatusText}
            </div>

            <div
              className={`padding-05 fdr fac radius-bottom-lg ${permitColorScheme.textAndIconColor} width-full font-sans-lg text-bold`}
            >
              <Icon className="display-none tablet:display-block tablet:margin-left-1 usa-icon--size-4">
                {getIcon(props.status)}
              </Icon>

              <p className="tablet:margin-left-1 padding-05 line-height-sans-3">{getText()}</p>
            </div>
          </div>
          <div className="padding-2">
            <Heading level={1} styleVariant="h4" className="margin-bottom-05-override tablet:padding-top-1">
              {Config.licenseSearchTask.applicationChecklistItems}
            </Heading>

            <hr className="tablet:margin-bottom-205" />

            {props.items.map(receiptItem)}
          </div>
        </div>
        <HorizontalLine />
        <div>
          <strong>{Config.taskDefaults.issuingAgencyText}: </strong>
          {getTaskAgencyText(props.agency, props.context ?? "")}
        </div>
      </div>
    </div>
  );
};
