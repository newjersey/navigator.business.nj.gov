import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { StateDropdown } from "@/components/StateDropdown";
import { FormationMunicipality } from "@/components/tasks/business-formation/business/FormationMunicipality";
import { MainBusinessAddressContainer } from "@/components/tasks/business-formation/business/MainBusinessAddressContainer";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { useMountEffect } from "@/lib/utils/helpers";
import { ReactElement, useContext } from "react";

export const MainBusinessAddressNj = (): ReactElement => {
  const { Config } = useConfig();
  const { setFormationFormData } = useContext(BusinessFormationContext);
  const { doSomeFieldsHaveError, doesFieldHaveError } = useFormationErrors();

  useMountEffect(() => {
    setFormationFormData((previousState) => {
      return {
        ...previousState,
        addressState: { name: "New Jersey", shortCode: "NJ" },
        addressCountry: "US",
      };
    });
  });

  return (
    <MainBusinessAddressContainer>
      <WithErrorBar
        hasError={doSomeFieldsHaveError(["addressState", "addressZipCode", "addressMunicipality"])}
        type="DESKTOP-ONLY"
        className="grid-gap-1 grid-row margin-top-2"
      >
        <WithErrorBar
          hasError={doesFieldHaveError("addressMunicipality")}
          type="MOBILE-ONLY"
          className="grid-col-12 tablet:grid-col-6 padding-left-0"
        >
          <span className="text-bold">{Config.formation.fields.addressMunicipality.label}</span>
          <FormationMunicipality />
        </WithErrorBar>
        <WithErrorBar
          hasError={doSomeFieldsHaveError(["addressState", "addressZipCode"])}
          type="MOBILE-ONLY"
          className=" orm-input grid-col-5 tablet:grid-col-2"
        >
          <b>{Config.formation.fields.addressState.label}</b>
          <StateDropdown
            fieldName="addressState"
            value={"New Jersey"}
            validationText={Config.formation.fields.addressState.error}
            disabled={true}
            onSelect={() => {}}
            className={"margin-top-2"}
          />
        </WithErrorBar>
        <BusinessFormationTextField
          label={Config.formation.fields.addressZipCode.label}
          numericProps={{ maxLength: 5 }}
          required={true}
          errorBarType="NEVER"
          fieldName={"addressZipCode"}
          validationText={Config.formation.fields.addressZipCode.error}
          className="form-input grid-col-7 tablet:grid-col-4"
        />
      </WithErrorBar>
      <Alert variant="info" className="margin-bottom-5">
        <Content>{Config.formation.fields.addressMunicipality.infoAlert}</Content>
      </Alert>
    </MainBusinessAddressContainer>
  );
};
