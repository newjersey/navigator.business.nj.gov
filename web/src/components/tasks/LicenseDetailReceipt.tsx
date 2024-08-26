import { ChecklistTag } from "@/components/ChecklistTag";
import { HorizontalLine } from "@/components/HorizontalLine";
import { Heading } from "@/components/njwds-extended/Heading";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { LicenseStatusHeader } from "@/components/tasks/LicenseStatusHeader";
import { getMergedConfig } from "@/contexts/configContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import {
  LicenseDetails,
  LicenseStatusItem,
  LicenseTaskID,
  taskIdLicenseNameMapping,
} from "@businessnjgovnavigator/shared/";
import type { ReactElement } from "react";

interface Props {
  licenseDetails: LicenseDetails;
  onEdit: () => void;
  licenseTaskId: LicenseTaskID;
}

const Config = getMergedConfig();

export const LicenseDetailReceipt = (props: Props): ReactElement => {
  const { business } = useUserData();

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
          <div className="padding-0">
            <LicenseStatusHeader licenseStatus={props.licenseDetails.licenseStatus} />
          </div>
          <div>
            <Heading
              level={2}
              styleVariant="h4"
              className="margin-bottom-1 padding-top-2 border-bottom-2px border-base-lightest padding-bottom-1"
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
