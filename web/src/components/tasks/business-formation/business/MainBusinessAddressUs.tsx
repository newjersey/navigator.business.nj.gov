import { ModifiedContent } from "@/components/ModifiedContent";
import { StateDropdown } from "@/components/StateDropdown";
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
        hasError={doSomeFieldsHaveError(["addressState", "addressZipCode", "addressCity"])}
        type="DESKTOP-ONLY"
      >
        <div className="grid-row grid-gap-1">
          <div className="grid-col-12 tablet:grid-col-6">
            <BusinessFormationTextField
              errorBarType="MOBILE-ONLY"
              label={Config.formation.fields.addressCity.label}
              fieldName="addressCity"
              required={true}
              validationText={getFieldErrorLabel("addressCity")}
            />
          </div>
          <div className="grid-col-12 tablet:grid-col-6 margin-top-2 tablet:margin-top-0">
            <WithErrorBar
              hasError={doSomeFieldsHaveError(["addressState", "addressZipCode"])}
              type="MOBILE-ONLY"
            >
              <div className="grid-row grid-gap-1">
                <div className="grid-col-5">
                  <strong>
                    <ModifiedContent>{Config.formation.fields.addressState.label}</ModifiedContent>
                  </strong>
                  <StateDropdown
                    fieldName="addressState"
                    value={state.formationFormData.addressState?.name}
                    error={doesFieldHaveError("addressState")}
                    validationText={Config.formation.fields.addressState.error}
                    required
                    onValidation={(): void => setFieldsInteracted(["addressState"])}
                    onSelect={(stateObject): void => {
                      setFormationFormData((previousFormationData) => {
                        return {
                          ...previousFormationData,
                          addressState: stateObject
                        };
                      });
                      setFieldsInteracted(["addressState"]);
                    }}
                  />
                </div>
                <div className="grid-col-7">
                  <BusinessFormationTextField
                    label={Config.formation.fields.addressZipCode.label}
                    numericProps={{ maxLength: 5 }}
                    required={true}
                    errorBarType="NEVER"
                    fieldName={"addressZipCode"}
                    validationText={Config.formation.fields.addressZipCode.foreign.errorUS}
                  />
                </div>
              </div>
            </WithErrorBar>
          </div>
        </div>
      </WithErrorBar>
    </>
  );
};
