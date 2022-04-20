import { Icon } from "@/components/njwds/Icon";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { LicenseStatus, LicenseStatusItem } from "@businessnjgovnavigator/shared/";
import React, { ReactElement, useEffect, useState } from "react";

interface Props {
  items: LicenseStatusItem[];
  status: LicenseStatus;
  onEdit: () => void;
}

type PermitTheme = {
  gradient: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  iconColor: string;
  headerIconColor: string;
};

const pendingPermitTheme: PermitTheme = {
  gradient: "gradient-blue",
  bgColor: "bg-info-lighter",
  textColor: "text-cyan",
  borderColor: "border-cyan",
  iconColor: "text-base-lighter",
  headerIconColor: "text-cyan",
};

const activePermitTheme: PermitTheme = {
  gradient: "gradient-green",
  bgColor: "bg-success-lighter",
  textColor: "text-success",
  borderColor: "border-success",
  iconColor: "text-success",
  headerIconColor: "text-success",
};

const grayPermitTheme: PermitTheme = {
  gradient: "gradient-gray",
  bgColor: "bg-gray-5",
  textColor: "text-gray-50",
  borderColor: "border-gray-50",
  iconColor: "text-gray-50",
  headerIconColor: "text-gray-50",
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
};

export const LicenseStatusReceipt = (props: Props): ReactElement => {
  const [theme, setTheme] = useState<PermitTheme>(pendingPermitTheme);
  const { userData } = useUserData();

  useEffect(() => {
    if (props.status === "ACTIVE") {
      setTheme(activePermitTheme);
    } else if (props.status === "PENDING") {
      setTheme(pendingPermitTheme);
    } else {
      setTheme(grayPermitTheme);
    }
  }, [props.status]);

  const getText = (): string => {
    return LicenseStatusLookup[props.status];
  };

  const getIcon = (status: LicenseStatus): string => {
    if (status === "ACTIVE") {
      return "check";
    } else if (status === "PENDING") {
      return "schedule";
    } else {
      return "warning";
    }
  };

  const getOneLineAddress = (): string => {
    if (!userData || !userData.licenseData) return "";
    const { nameAndAddress } = userData.licenseData;

    const secondLineAddress = nameAndAddress.addressLine2 ? ` ${nameAndAddress.addressLine2}` : "";

    return `${nameAndAddress.addressLine1}${secondLineAddress}, ${nameAndAddress.zipCode} NJ`;
  };

  const getIconColor = (item: LicenseStatusItem): string => {
    if (props.status === "ACTIVE" || props.status === "PENDING") {
      return item.status === "ACTIVE" ? activePermitTheme.iconColor : pendingPermitTheme.iconColor;
    } else {
      return item.status === "ACTIVE" ? grayPermitTheme.iconColor : pendingPermitTheme.iconColor;
    }
  };

  const receiptItem = (item: LicenseStatusItem, index: number): ReactElement => {
    const border = index !== 0 ? "border-top-1px border-base-light" : "";

    return (
      <div className="padding-x-3 fdr fac width-100" data-testid={`item-${item.status}`} key={index}>
        <Icon className={`${getIconColor(item)} usa-icon--size-3`}>{getIcon(item.status)}</Icon>
        <span className={`margin-left-2 padding-y-1 fg1 receipt-item ${border}`}>{item.title}</span>
      </div>
    );
  };

  return (
    <div className="fdc fg1 overflow-y-hidden margin-top-3">
      <p className="margin-x-3 margin-bottom-3">{Config.licenseSearchTask.foundText}</p>

      <div className={`${theme.gradient} fg1 fdr fjc`}>
        <div className="receipt-box padding-bottom-10">
          <div
            className={`${theme.bgColor} ${theme.borderColor} padding-3 border-top-2px font-body-md text-bold fdr fac`}
            data-testid={`permit-${props.status}`}
          >
            <span className="padding-right-1">{Config.licenseSearchTask.permitStatusText}</span>
            <Icon className={`${theme.headerIconColor} usa-icon--size-3`}>{getIcon(props.status)}</Icon>
            <span className={`${theme.textColor} padding-left-05 text-uppercase`}>{getText()}</span>
          </div>
          <div className="margin-3 font-body-2xs">
            <div className="fdr">
              <div className="text-bold">{userData?.licenseData?.nameAndAddress.name}</div>
              <button
                data-testid="edit-button"
                onClick={() => {
                  analytics.event.task_status_checklist_edit_button.click.edit_address_form();
                  props.onEdit();
                }}
                className="usa-button usa-button--unstyled mla font-body-2xs underline width-auto"
              >
                {Config.licenseSearchTask.editButtonText}
              </button>
            </div>
            <div className="border-dashed border-bottom-2px border-top-0 border-left-0 border-right-0 border-base-lighter padding-bottom-3">
              {getOneLineAddress()}
            </div>
          </div>
          {props.items.map(receiptItem)}
        </div>
      </div>
    </div>
  );
};
