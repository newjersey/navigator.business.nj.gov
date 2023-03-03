import { Content } from "@/components/Content";
import { StateDropdown } from "@/components/StateDropdown";
import { MainBusinessAddressContainer } from "@/components/tasks/business-formation/business/MainBusinessAddressContainer";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { ReactElement, useContext } from "react";

export const MainBusinessUs = (): ReactElement => {
  const { Config } = useConfig();
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { doSomeFieldsHaveError, doesFieldHaveError, getFieldErrorLabel } = useFormationErrors();

  return (
    <MainBusinessAddressContainer>
      <WithErrorBar
        hasError={doSomeFieldsHaveError(["addressState", "addressZipCode", "addressCity"])}
        type="DESKTOP-ONLY"
        className="grid-gap-1 grid-row margin-top-2"
      >
        <BusinessFormationTextField
          errorBarType="MOBILE-ONLY"
          label={Config.formation.fields.addressCity.label}
          fieldName="addressCity"
          required={true}
          className={"margin-bottom-2 grid-col-12 tablet:grid-col-6"}
          noValidationMargin={true}
          validationText={getFieldErrorLabel("addressCity")}
          formInputFull
        />
        <>
          <WithErrorBar
            hasError={doSomeFieldsHaveError(["addressState", "addressZipCode"])}
            type="MOBILE-ONLY"
            className="form-input grid-col-5 tablet:grid-col-2"
          >
            <Content>{Config.formation.fields.addressState.label}</Content>
            <StateDropdown
              fieldName="addressState"
              value={state.formationFormData.addressState?.name}
              error={doesFieldHaveError("addressState")}
              validationText={Config.formation.fields.addressState.error}
              required
              onValidation={() => setFieldsInteracted(["addressState"])}
              onSelect={(stateObject) => {
                setFormationFormData((previousFormationData) => {
                  return {
                    ...previousFormationData,
                    addressState: stateObject,
                  };
                });
                setFieldsInteracted(["addressState"]);
              }}
              className={"margin-top-2"}
            />
          </WithErrorBar>

          <BusinessFormationTextField
            label={Config.formation.fields.addressZipCode.label}
            numericProps={{ maxLength: 5 }}
            required={true}
            errorBarType="NEVER"
            fieldName={"addressZipCode"}
            validationText={Config.formation.fields.addressZipCode.foreign.errorUS}
            className="form-input grid-col-7 tablet:grid-col-4"
          />
        </>
      </WithErrorBar>
    </MainBusinessAddressContainer>
  );
};
