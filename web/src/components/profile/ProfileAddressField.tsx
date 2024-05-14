import { ModifiedContent } from "@/components/ModifiedContent";
import { StateDropdown } from "@/components/StateDropdown";
import { FormationMunicipality } from "@/components/tasks/business-formation/business/FormationMunicipality";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { useMountEffect } from "@/lib/utils/helpers";
import { ReactElement, useContext } from "react";

export const ProfileAddressField = (): ReactElement => {
  const { Config } = useConfig();
  const { setFormationFormData } = useContext(BusinessFormationContext);
  const { doSomeFieldsHaveError, doesFieldHaveError, getFieldErrorLabel } = useFormationErrors();

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
      <>
        <div id={`question-addressLine1`} className="text-field-width-default add-spacing-on-ele-scroll">
          <BusinessFormationTextField
            label={Config.formation.fields.addressLine1.label}
            fieldName="addressLine1"
            required={true}
            className={"margin-bottom-2"}
            errorBarType="ALWAYS"
            validationText={getFieldErrorLabel("addressLine1")}
          />
        </div>

        <div id={`question-addressLine2`} className="text-field-width-default add-spacing-on-ele-scroll">
          <BusinessFormationTextField
            label={Config.formation.fields.addressLine2.label}
            secondaryLabel={Config.formation.general.optionalLabel}
            errorBarType="ALWAYS"
            fieldName="addressLine2"
            validationText={getFieldErrorLabel("addressLine2")}
            className="margin-bottom-2"
          />
        </div>
        <WithErrorBar
          hasError={doSomeFieldsHaveError(["addressState", "addressZipCode", "addressMunicipality"])}
          type="DESKTOP-ONLY"
        >
          <div className="grid-row grid-gap-1">
            <div className="grid-col-12 tablet:grid-col-6">
              <WithErrorBar hasError={doesFieldHaveError("addressMunicipality")} type="MOBILE-ONLY">
                <span className="text-bold">{Config.formation.fields.addressMunicipality.label}</span>
                <FormationMunicipality />
              </WithErrorBar>
            </div>
            <div className="grid-col-12 tablet:grid-col-5 margin-top-2 tablet:margin-top-0">
              <WithErrorBar
                hasError={doSomeFieldsHaveError(["addressState", "addressZipCode"])}
                type="MOBILE-ONLY"
              >
                <div className="grid-row grid-gap-1">
                  <div className="grid-col-2">
                    <strong>
                      <ModifiedContent>{Config.formation.fields.addressState.label}</ModifiedContent>
                    </strong>
                    <div
                      id={`question-addressState`}
                      className="text-field-width-default add-spacing-on-ele-scroll"
                    >
                      <StateDropdown
                        fieldName="addressState"
                        value={"New Jersey"}
                        validationText={Config.formation.fields.addressState.error}
                        disabled={true}
                        onSelect={(): void => {}}
                      />
                    </div>
                  </div>
                  <div className="grid-col-3">
                    <div
                      id={`question-addressZipCode`}
                      className="text-field-width-default add-spacing-on-ele-scroll"
                    >
                      <BusinessFormationTextField
                        label={Config.formation.fields.addressZipCode.label}
                        numericProps={{ maxLength: 5 }}
                        required={true}
                        errorBarType="NEVER"
                        fieldName={"addressZipCode"}
                        validationText={getFieldErrorLabel("addressZipCode")}
                      />
                    </div>
                  </div>
                </div>
              </WithErrorBar>
            </div>
          </div>
        </WithErrorBar>
        <hr aria-hidden={true} />
      </>
    </>
  );
};
