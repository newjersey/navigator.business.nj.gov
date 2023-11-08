import { CannabisLocationAlert } from "@/components/CannabisLocationAlert";
import { Content } from "@/components/Content";
import { ModifiedContent } from "@/components/ModifiedContent";
import { Alert } from "@/components/njwds-extended/Alert";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { StateDropdown } from "@/components/StateDropdown";
import { FormationMunicipality } from "@/components/tasks/business-formation/business/FormationMunicipality";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { FormationField } from "@/components/tasks/business-formation/FormationField";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormationErrors } from "@/lib/data-hooks/useFormationErrors";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { useMountEffect } from "@/lib/utils/helpers";
import { ReactElement, useContext, useState } from "react";
import { isValidWithAssociatedFields } from "../validation/isValidWithAssociatedFields";
import {useFormContextFieldHelpers} from "@/lib/data-hooks/useFormContextFieldHelpers";
import {FormationFormContext} from "@/contexts/formationFormContext";
import {AddressLine1} from "@/components/tasks/business-formation/business/AddressLine1";
import { AddressZipCode } from "./AddressZipCode";

export const MainBusinessAddressNj = (): ReactElement => {
  const { Config } = useConfig();
  const { setFormationFormData, state } = useContext(BusinessFormationContext);
  const { business } = useUserData();

  const isAddressZipCodeInvalid = useFormContextFieldHelpers("addressZipCode", FormationFormContext).isFormFieldInvalid
  const isAddressMunicipalityInvalid = useFormContextFieldHelpers("addressMunicipality", FormationFormContext).isFormFieldInvalid

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
        <div role="heading" aria-level={2} className="h3-styling margin-0-override">
          {Config.formation.sections.addressHeader}{" "}
          <span className="text-normal font-body-lg">{Config.formation.general.optionalLabel}</span>
        </div>
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
          <CannabisLocationAlert industryId={business?.profileData.industryId} />
          <AddressLine1 />
          <FormationField fieldName="addressLine2">
            <BusinessFormationTextField
              label={Config.formation.fields.addressLine2.label}
              secondaryLabel={Config.formation.general.optionalLabel}
              errorBarType="ALWAYS"
              fieldName="addressLine2"
              className="margin-bottom-2"
            />
          </FormationField>
          <WithErrorBar
            hasError={isAddressMunicipalityInvalid || isAddressZipCodeInvalid}
            type="DESKTOP-ONLY"
          >
            <div className="grid-row grid-gap-1">
              <div className="grid-col-12 tablet:grid-col-6">
                <FormationMunicipality />
              </div>
              <div className="grid-col-12 tablet:grid-col-6 margin-top-2 tablet:margin-top-0">
                <WithErrorBar
                  hasError={isAddressZipCodeInvalid}
                  type="MOBILE-ONLY"
                >
                  <div className="grid-row grid-gap-1">
                    <div className="grid-col-5">
                      <strong>
                        <ModifiedContent>{Config.formation.fields.addressState.label}</ModifiedContent>
                      </strong>
                      <FormationField fieldName="addressState">
                        <StateDropdown
                          fieldName="addressState"
                          value={"New Jersey"}
                          validationText={Config.formation.fields.addressState.error}
                          disabled={true}
                          onSelect={(): void => {}}
                        />
                      </FormationField>
                    </div>
                    <div className="grid-col-7">
                      <AddressZipCode />
                    </div>
                  </div>
                </WithErrorBar>
              </div>
            </div>
          </WithErrorBar>
          <Alert variant="info" className="margin-top-3 margin-bottom-4">
            <Content>{Config.formation.fields.addressMunicipality.infoAlert}</Content>
          </Alert>
        </>
      )}
    </>
  );
};
