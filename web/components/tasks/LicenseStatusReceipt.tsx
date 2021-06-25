import { LicenseStatus, LicenseStatusItem } from "@/lib/types/types";
import React, { ReactElement, useEffect, useState } from "react";
import { LicenseScreenDefaults } from "@/display-content/tasks/license/LicenseScreenDefaults";
import { Icon } from "@/components/njwds/Icon";
import { useUserData } from "@/lib/data-hooks/useUserData";

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
};

const pendingPermitTheme: PermitTheme = {
  gradient: "gradient-blue",
  bgColor: "bg-info-lighter",
  textColor: "text-cyan",
  borderColor: "border-cyan",
  iconColor: "text-base-lighter",
};

const activePermitTheme: PermitTheme = {
  gradient: "gradient-green",
  bgColor: "bg-success-lighter",
  textColor: "text-success",
  borderColor: "border-success",
  iconColor: "text-success",
};

export const LicenseStatusReceipt = (props: Props): ReactElement => {
  const [theme, setTheme] = useState<PermitTheme>(pendingPermitTheme);
  const { userData } = useUserData();

  useEffect(() => {
    if (props.status === "ACTIVE") {
      setTheme(activePermitTheme);
    }
    if (props.status === "PENDING") {
      setTheme(pendingPermitTheme);
    }
  }, [props.status]);

  const getText = (): string => {
    if (props.status === "ACTIVE") {
      return LicenseScreenDefaults.activePermitStatusText;
    } else if (props.status === "PENDING") {
      return LicenseScreenDefaults.pendingPermitStatusText;
    }
    return "";
  };

  const getIcon = (status: LicenseStatus): string => {
    if (status === "ACTIVE") {
      return "check";
    } else if (status === "PENDING") {
      return "schedule";
    }
    return "";
  };

  const getOneLineAddress = (): string => {
    if (!userData || !userData.licenseData) return "";
    const { nameAndAddress } = userData.licenseData;

    const secondLineAddress = nameAndAddress.addressLine2 ? ` ${nameAndAddress.addressLine2}` : "";

    return `${nameAndAddress.addressLine1}${secondLineAddress}, ${nameAndAddress.zipCode} NJ`;
  };

  const receiptItem = (item: LicenseStatusItem, index: number): ReactElement => {
    const border = index !== 0 ? "border-top-1px border-base-light" : "";
    const iconColor = item.status === "ACTIVE" ? activePermitTheme.iconColor : pendingPermitTheme.iconColor;

    return (
      <div className="padding-x-3 fdr fac width-100" data-testid={`item-${item.status}`} key={index}>
        <Icon className={`${iconColor} usa-icon--size-3`}>{getIcon(item.status)}</Icon>
        <span className={`margin-left-2 padding-y-1 fg1 receipt-item ${border}`}>{item.title}</span>
      </div>
    );
  };

  return (
    <div className="fdc fg1 overflow-y-hidden">
      <p className="margin-x-3 margin-bottom-3">{LicenseScreenDefaults.foundText}</p>

      <div className={`${theme.gradient} fg1 fdr fjc`}>
        <div className="receipt-box padding-bottom-10">
          <div
            className={`${theme.bgColor} ${theme.borderColor} padding-3 border-top-2px font-body-md text-bold fdr fac`}
            data-testid={`permit-${props.status}`}
          >
            <span className="padding-right-05">{LicenseScreenDefaults.permitStatusText}</span>
            <Icon className={`${theme.iconColor} usa-icon--size-3`}>{getIcon(props.status)}</Icon>
            <span className={`${theme.textColor} padding-left-05 text-uppercase`}>{getText()}</span>
          </div>
          <div className="margin-3 font-body-2xs">
            <div className="fdr">
              <div className="text-bold">{userData?.licenseData?.nameAndAddress.name}</div>
              <button
                data-testid="edit-button"
                onClick={props.onEdit}
                className="usa-button usa-button--unstyled mla font-body-2xs underline width-auto"
              >
                {LicenseScreenDefaults.editButtonText}
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
