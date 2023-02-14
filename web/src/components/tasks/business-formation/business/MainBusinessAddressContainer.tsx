import { Content } from "@/components/Content";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { ReactElement, ReactNode } from "react";

export const MainBusinessAddressContainer = (props: { children: ReactNode }): ReactElement => {
  const { Config } = useConfig();
  const { getFieldErrorLabel } = useFormationErrors();

  return (
    <>
      <div className="margin-bottom-2">
        <Content>{Config.formation.sections.addressHeader}</Content>
      </div>
      <BusinessFormationTextField
        label={Config.formation.fields.addressLine1.label}
        placeholder={Config.formation.fields.addressLine1.placeholder}
        fieldName="addressLine1"
        required={true}
        className={"margin-bottom-2"}
        errorBarType="ALWAYS"
        validationText={getFieldErrorLabel("addressLine1")}
        formInputFull
      />
      <BusinessFormationTextField
        label={Config.formation.fields.addressLine2.label}
        placeholder={Config.formation.fields.addressLine2.placeholder}
        errorBarType="ALWAYS"
        fieldName="addressLine2"
        formInputFull
        validationText={getFieldErrorLabel("addressLine2")}
        className="margin-bottom-2"
      />
      {props.children}
    </>
  );
};
