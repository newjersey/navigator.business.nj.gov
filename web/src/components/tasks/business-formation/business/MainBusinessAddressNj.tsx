import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { StateDropdown } from "@/components/StateDropdown";
import { FormationMunicipality } from "@/components/tasks/business-formation/business/FormationMunicipality";
import { MainBusinessAddressContainer } from "@/components/tasks/business-formation/business/MainBusinessAddressContainer";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { useMountEffect } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useContext } from "react";

export const MainBusinessAddressNj = (): ReactElement => {
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
          <span className="text-bold">{Config.businessFormationDefaults.addressMunicipalityLabel}</span>
          <FormationMunicipality />
        </WithErrorBar>
        <WithErrorBar
          hasError={doSomeFieldsHaveError(["addressState", "addressZipCode"])}
          type="MOBILE-ONLY"
          className=" orm-input grid-col-5 tablet:grid-col-2"
        >
          <Content>{Config.businessFormationDefaults.addressStateLabel}</Content>
          <StateDropdown
            fieldName="addressState"
            value={"New Jersey"}
            placeholder={Config.businessFormationDefaults.addressModalStatePlaceholder}
            validationText={Config.businessFormationDefaults.addressStateErrorText}
            disabled={true}
            onSelect={() => {}}
            className={"margin-top-2"}
          />
        </WithErrorBar>
        <BusinessFormationTextField
          label={Config.businessFormationDefaults.addressZipCodeLabel}
          placeholder={Config.businessFormationDefaults.addressZipCodePlaceholder}
          numericProps={{ maxLength: 5 }}
          required={true}
          errorBarType="NEVER"
          fieldName={"addressZipCode"}
          validationText={Config.businessFormationDefaults.addressZipCodeErrorText}
          className="form-input grid-col-7 tablet:grid-col-4"
        />
      </WithErrorBar>
      <Alert variant="info" className="margin-bottom-5">
        <Content>{Config.businessFormationDefaults.businessLocationInfoAlertMarkdown}</Content>
      </Alert>
    </MainBusinessAddressContainer>
  );
};
