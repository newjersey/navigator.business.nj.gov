import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, ReactNode } from "react";

export const MainBusinessAddressContainer = (props: { children: ReactNode }): ReactElement => {
  return (
    <>
      <div className="margin-bottom-2">
        <Content>{Config.businessFormationDefaults.addressHeader}</Content>
      </div>
      <BusinessFormationTextField
        label={Config.businessFormationDefaults.addressAddressLine1Label}
        placeholder={Config.businessFormationDefaults.addressAddressLine1Placeholder}
        fieldName="addressLine1"
        required={true}
        className={"margin-bottom-2"}
        noValidationMargin={true}
        validationText={Config.businessFormationDefaults.addressLine1ErrorText}
        formInputFull
      />
      <BusinessFormationTextField
        label={Config.businessFormationDefaults.addressAddressLine2Label}
        placeholder={Config.businessFormationDefaults.addressAddressLine2Placeholder}
        fieldName="addressLine2"
        formInputFull
        className="margin-bottom-2"
      />
      {props.children}
      <Alert variant="info" className="margin-bottom-5">
        <Content>{Config.businessFormationDefaults.businessLocationInfoAlertMarkdown}</Content>
      </Alert>
    </>
  );
};
