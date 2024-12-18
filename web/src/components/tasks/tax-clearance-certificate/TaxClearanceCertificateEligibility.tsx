import {ReactElement, useContext} from "react";
import {Heading} from "@/components/njwds-extended/Heading";
import {AddressTextField} from "@/components/data-fields/address/AddressTextField";
import {useConfig} from "@/lib/data-hooks/useConfig";
import {ModifiedContent} from "@/components/ModifiedContent";
import {StateDropdown} from "@/components/StateDropdown";
import {useMediaQuery} from "@mui/material";
import {TaxClearanceDropdown} from "@/components/tasks/tax-clearance-certificate/TaxClearanceDropDown";
import {MediaQueries} from "@/lib/PageSizes";
import {GenericTextField} from "@/components/GenericTextField";
import {TaxCertificateContext} from "@/contexts/taxCertificateContext";
import {useMountEffectWhenDefined} from "@/lib/utils/helpers";
import {useUserData} from "@/lib/data-hooks/useUserData";
import {Business} from "@businessnjgovnavigator/shared/userData";

interface Props {
  CMS_ONLY_fakeBusiness?: Business;
}


export const TaxClearanceCertificateEligibility= (props: Props): ReactElement => {
  const { state, setAddressData } = useContext(TaxCertificateContext);
  const { Config } = useConfig();
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const userDataFromHook = useUserData();
  const business = props.CMS_ONLY_fakeBusiness ?? userDataFromHook.business;
  const taxClearance = [{"name": "name", "displayName": "display"},
    {"name": "name2", "displayName": "display2"},
    {"name": "name3", "displayName": "display3"},
    {"name": "name4", "displayName": "display4"}]


  const isFormed:boolean = false;


  useMountEffectWhenDefined(() => {
    if (business) {
      setAddressData({
        addressLine1: business.formationData.formationFormData.addressLine1,
        addressLine2: business.formationData.formationFormData.addressLine2,
        addressCity: business.formationData.formationFormData.addressCity,
        addressMunicipality: business.formationData.formationFormData.addressMunicipality,
        addressState: business.formationData.formationFormData.addressState,
        addressZipCode: business.formationData.formationFormData.addressZipCode,
        addressCountry: business.formationData.formationFormData.addressCountry,
        addressProvince: business.formationData.formationFormData.addressProvince,
        businessLocationType: "US"
      });
    }
  }, business);

  return (
    <>
      <div data-testid="tax-clearance-certificate-tab-header">
        <Heading level={2} className="margin-bottom-4" style={{fontWeight: 300}}>
          {Config.taxClearanceCertificateTask.certificationReasonLabel}
        </Heading>
        <div className={"margin-bottom-1"}>
          <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
            <div className={"grid-col-12"}>
              <span className="text-bold">{Config.taxClearanceCertificateTask.taxCertificateAgencyLabel}</span>
            </div>
          </div>
          <div className={`${isTabletAndUp ? "grid-row" : "display-block"}`}>
            <div className={"grid-col-12"}>
              {isFormed ? (<div>Checking</div>) :
                (<TaxClearanceDropdown
                onValidation={undefined}
                taxClearances={taxClearance}
                fieldName={"taxClearance"}
                error={false}
                value={{"name": "name", "displayName": "display"}}
                onSelect={() => {
                }}
                helperText={""}
              />)}
            </div>
          </div>
        </div>
      </div>
      <hr className="desktop:margin-top-0 margin-top-4 margin-bottom-2"/>
      <div data-testid="tax-clearance-certificate-business-information-header">
        <Heading level={2} className="margin-bottom-4" style={{fontWeight: 300}}>
          Business Information
        </Heading>
      </div>
      <div>
        <div className={"margin-bottom-1"}>
          <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
            <div className={"grid-col-12"}>
              <span className="text-bold">{Config.taxClearanceCertificateTask.businessNameLabel}</span>
            </div>
          </div>
          <div className={`${isTabletAndUp ? "grid-row" : "display-block"}`}>
            <div className={"grid-col-12"}>
              {isFormed ? (<div>Checking</div>) :(
              <GenericTextField
                inputWidth="full"
                value={""}
                handleChange={(): void => {

                }}
                error={undefined}
                onValidation={undefined}
                validationText={undefined}
                fieldName="businessName"
                required={true}
                autoComplete="name"
              />)}
            </div>
          </div>
          <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
            <div className={"grid-col-12"}>
              <span className="text-bold">{Config.taxClearanceCertificateTask.entityIdLabel}</span>
            </div>
          </div>
          <div className={`${isTabletAndUp ? "grid-row" : "display-block"}`}>
            <div className={"grid-col-12"}>
              {isFormed ? (<div>Checking</div>):(
              <GenericTextField
                inputWidth="full"
                value={""}
                handleChange={(): void => {

                }}
                error={undefined}
                onValidation={undefined}
                validationText={undefined}
                fieldName="entityId"
                required={true}
                autoComplete="name"
              />)}
            </div>
          </div>
        </div>

      </div>
      <div>

      </div>
      <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
        <div className={"grid-col-12"}>
          <span className="text-bold">{Config.taxClearanceCertificateTask.addressLine1Label}</span>
        </div>
      </div>
      <div className={`${isTabletAndUp ? "grid-row" : "display-block"}`}>
        <div className={"grid-col-12"}>
          {isFormed ? (<div>Checking</div>):(
          <GenericTextField
            inputWidth="full"
            value={state.formationAddressData.addressLine1}
            handleChange={(): void => {

            }}
            error={undefined}
            onValidation={undefined}
            validationText={undefined}
            fieldName="addressLine1"
            required={true}
            autoComplete="name"
          />)}
        </div>
      </div>
      <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
        <div className={"grid-col-12"}>
          <span className="text-bold">{Config.taxClearanceCertificateTask.addressLine2Label}</span>
        </div>
      </div>
      <div className={`${isTabletAndUp ? "grid-row" : "display-block"}`}>
        <div className={"grid-col-12"}>
          {isFormed ? (<div>Checking</div>):(
          <GenericTextField
            inputWidth="full"
            value={state.formationAddressData.addressLine2}
            handleChange={(): void => {

            }}
            error={undefined}
            onValidation={undefined}
            validationText={undefined}
            fieldName="addressLine2"
            required={true}
            autoComplete="name"
          />)}
        </div>
      </div>
      <div>
        <div className={"margin-top-1"}>
          <div className="grid-row">
            <div className="grid-col-12 tablet:grid-col-6">
              <span className="text-bold">{Config.formation.fields.addressCity.label}</span>
            </div>
            <div className="grid-col-12 tablet:grid-col-6 margin-top-2 tablet:margin-top-0">
              <div className="grid-row grid-gap tablet:grid-gap-2">
                <div className="grid-col-6">
                  <strong>
                    <ModifiedContent>{Config.formation.fields.addressState.label}</ModifiedContent>
                  </strong>
                  <div
                    id={`question-addressState`}
                    className="add-spacing-on-ele-scroll"
                  >
                    <StateDropdown
                      fieldName="addressState"
                      value={state.formationAddressData.addressState?.shortCode}
                      disabled={false}
                      onSelect={(): void => {
                      }}
                    />
                  </div>
                </div>
                <div className="grid-col-6">
                  <div
                    id={`question-addressZipCode`}
                    className="add-spacing-on-ele-scroll"
                  >
                    <AddressTextField
                      label={Config.formation.fields.addressZipCode.label}
                      numericProps={{maxLength: 5}}
                      errorBarType="NEVER"
                      fieldName={"addressZipCode"}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div className={"grid-col-12"}>
            <span className="text-bold">{Config.taxClearanceCertificateTask.taxIdLabel}</span>
          </div>
        </div>
        <div className={`${isTabletAndUp ? "grid-row" : "display-block"}`}>
          <div className={"grid-col-12"}>
          </div>
        </div>
        <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div className={"grid-col-12"}>
            <span className="text-bold">{Config.taxClearanceCertificateTask.taxPinLabel}</span>
          </div>
        </div>
        <div className={`${isTabletAndUp ? "grid-row" : "display-block"}`}>
          <div className={"grid-col-12"}>
          </div>
        </div>
      </div>

    </>
  );
}
