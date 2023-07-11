import { Content } from "@/components/Content";
import { ModifiedContent } from "@/components/ModifiedContent";
import { Alert } from "@/components/njwds-extended/Alert";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { StateDropdown } from "@/components/StateDropdown";
import { FormationMunicipality } from "@/components/tasks/business-formation/business/FormationMunicipality";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { useMountEffect } from "@/lib/utils/helpers";
import { ReactElement, useContext, useState } from "react";

export const MainBusinessAddressNj = (): ReactElement => {
  const { Config } = useConfig();
  const { setFormationFormData, state } = useContext(BusinessFormationContext);
  const { doSomeFieldsHaveError, doesFieldHaveError, getFieldErrorLabel } = useFormationErrors();

  const doAnyFieldsHaveAValue = (): boolean => {
    const fields = [
      state.formationFormData.addressLine1,
      state.formationFormData.addressLine2,
      state.formationFormData.addressMunicipality,
      state.formationFormData.addressZipCode,
    ];
    return fields.some((value) => !!value);
  };

  const [isExpanded, setIsExpanded] = useState(doAnyFieldsHaveAValue());

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
    <>
      <div
        data-testid={"main-business-address-container-header"}
        className="flex flex-column mobile-lg:flex-row mobile-lg:flex-align-center margin-bottom-2"
      >
        <h3 className="margin-bottom-0">{Config.formation.sections.addressHeader} </h3>
        <div className="mobile-lg:margin-left-auto flex mobile-lg:flex-justify-center">
          {!isExpanded && (
            <div data-testid={"add-address-button"}>
              <UnStyledButton style="default" onClick={(): void => setIsExpanded(true)}>
                {Config.formation.sections.addressAddButtonText}
              </UnStyledButton>
            </div>
          )}
        </div>
      </div>
      {isExpanded && (
        <>
          <BusinessFormationTextField
            label={Config.formation.fields.addressLine1.label}
            fieldName="addressLine1"
            required={true}
            className={"margin-bottom-2"}
            errorBarType="ALWAYS"
            validationText={getFieldErrorLabel("addressLine1")}
          />
          <BusinessFormationTextField
            label={Config.formation.fields.addressLine2.label}
            secondaryLabel={Config.formation.general.optionalLabel}
            errorBarType="ALWAYS"
            fieldName="addressLine2"
            validationText={getFieldErrorLabel("addressLine2")}
            className="margin-bottom-2"
          />
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
              <strong>
                <ModifiedContent>{Config.formation.fields.addressState.label}</ModifiedContent>
              </strong>
              <StateDropdown
                fieldName="addressState"
                value={"New Jersey"}
                validationText={Config.formation.fields.addressState.error}
                disabled={true}
                onSelect={(): void => {}}
              />
            </WithErrorBar>
            <BusinessFormationTextField
              label={Config.formation.fields.addressZipCode.label}
              numericProps={{ maxLength: 5 }}
              required={true}
              errorBarType="NEVER"
              fieldName={"addressZipCode"}
              validationText={getFieldErrorLabel("addressZipCode")}
              className="grid-col-7 tablet:grid-col-4"
            />
          </WithErrorBar>
          <Alert variant="info" className="margin-bottom-5">
            <Content>{Config.formation.fields.addressMunicipality.infoAlert}</Content>
          </Alert>
        </>
      )}
    </>
  );
};
