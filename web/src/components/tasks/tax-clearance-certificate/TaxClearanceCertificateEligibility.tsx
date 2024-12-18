import {ReactElement } from "react";
import {useUserData} from "@/lib/data-hooks/useUserData";
import {Business} from "@businessnjgovnavigator/shared/userData";
import {Heading} from "@/components/njwds-extended/Heading";
import {AddressTextField} from "@/components/data-fields/address/AddressTextField";
import {useConfig} from "@/lib/data-hooks/useConfig";
import {ModifiedContent} from "@/components/ModifiedContent";
import {StateDropdown} from "@/components/StateDropdown";

interface Props {
  CMS_ONLY_fakeBusiness?: Business;
}

export const TaxClearanceCertificateEligibility= (props: Props): ReactElement => {
  const userDataFromHook = useUserData();
  const business = props.CMS_ONLY_fakeBusiness ?? userDataFromHook.business;
  const { Config } = useConfig();

  const addressLines1And2 = (): ReactElement => {
    return (
      <>
        <div id={`question-addressLine1`} className="text-field-width-default add-spacing-on-ele-scroll">
          <AddressTextField
            label={Config.formation.fields.addressLine1.label}
            fieldName="addressLine1"
            //validationText={getFieldErrorLabel("addressLine1")}
            className={"margin-bottom-2"}
            errorBarType="ALWAYS"
            //onValidation={onValidation}
          />
        </div>
        <div id={`question-addressLine2`} className="text-field-width-default add-spacing-on-ele-scroll">
          <AddressTextField
            label={Config.formation.fields.addressLine2.label}
            secondaryLabel={Config.formation.general.optionalLabel}
            errorBarType="ALWAYS"
            fieldName="addressLine2"
            //validationText={getFieldErrorLabel("addressLine2")}
            className="margin-bottom-2"
            //onValidation={onValidation}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <div data-testid="tax-clearance-certificate-tab-header">
        <Heading level={2} className="margin-bottom-4" style={{fontWeight: 300}}>
          Reason for Certification
        </Heading>
      </div>
      <div data-testid="tax-clearance-certificate-business-information-header">
        <hr className="desktop:margin-top-0 margin-top-4 margin-bottom-2"/>
        <Heading level={2} className="margin-bottom-4" style={{fontWeight: 300}}>
          Business Information
        </Heading>
      </div>
      <div>

      </div>
      <div>
        {addressLines1And2()}
      </div>
      <div className="text-field-width-default">
        {/*<WithErrorBar*/}
        {/*  hasError={doSomeFieldsHaveError(["addressState", "addressZipCode", "addressMunicipality"])}*/}
        {/*  type="DESKTOP-ONLY"*/}
        {/*>*/}
        <div className="grid-row tablet:grid-gap-2">
          <div className="grid-col-12 tablet:grid-col-6">
            {/*<WithErrorBar hasError={doesFieldHaveError("addressMunicipality")} type="MOBILE-ONLY">*/}
            <span className="text-bold">{Config.formation.fields.addressCity.label}</span>
            {/*<AddressMunicipalityDropdown onValidation={onValidation}/>*/}
            {/*</WithErrorBar>*/}
          </div>
          <div className="grid-col-12 tablet:grid-col-6 margin-top-2 tablet:margin-top-0">
            {/*<WithErrorBar*/}
            {/*  // hasError={doSomeFieldsHaveError(["addressState", "addressZipCode"])}*/}
            {/*  type="MOBILE-ONLY"*/}
            {/*>*/}
            <div className="grid-row grid-gap tablet:grid-gap-2">
              <div className="grid-col-6">
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
                    onSelect={(): void => {
                    }}
                  />
                </div>
              </div>
              <div className="grid-col-6">
                <div
                  id={`question-addressZipCode`}
                  className="text-field-width-default add-spacing-on-ele-scroll"
                >
                  <AddressTextField
                    label={Config.formation.fields.addressZipCode.label}
                    numericProps={{maxLength: 5}}
                    errorBarType="NEVER"
                    // validationText={getFieldErrorLabel("addressZipCode")}
                    fieldName={"addressZipCode"}
                    // onValidation={onValidation}
                  />
                </div>
              </div>
            </div>
            {/*</WithErrorBar>*/}
          </div>
        </div>
        {/*</WithErrorBar>*/}
        <div id={``} className="text-field-width-default add-spacing-on-ele-scroll">
          one
        </div>
        <div id={``} className="text-field-width-default add-spacing-on-ele-scroll">
          two
        </div>
      </div>

    </>
  );
}
