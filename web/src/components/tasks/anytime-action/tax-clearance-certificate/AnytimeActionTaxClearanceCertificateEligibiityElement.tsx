import {Heading} from "@/components/njwds-extended/Heading";
import {
  TaxClearanceCertificateIssuingAgencyDropdown
} from "@/components/tasks/anytime-action/tax-clearance-certificate/TaxClearanceCertificateIssuingAgencyDropdown";
import {TaxClearanceCertificateContext} from "@/contexts/taxClearanceCertificateContext";
import {ReactElement, useContext} from "react";
import {useConfig} from "@/lib/data-hooks/useConfig";
import {useMediaQuery} from "@mui/material";
import {MediaQueries} from "@/lib/PageSizes";
import {
  TaxClearanceCertificate,
  TaxClearanceCertificateIssuingAgencies,
  TaxClearanceCertificateIssuingAgency
} from "@businessnjgovnavigator/shared/taxClearanceCertificate";
import {GenericTextField} from "@/components/GenericTextField";

export const AnytimeActionTaxClearanceCertificateEligibiityElement = (): ReactElement => {
  const { taxClearanceCertificateState, setTaxClearanceCertificateState } = useContext(TaxClearanceCertificateContext);
  const { Config } = useConfig();
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);


  return (
    <>
      <div data-testid="tax-clearance-certificate-editableFields">
        <Heading level={2} data-testid={"eligibilityMainHeader"} className="margin-bottom-4" style={{ fontWeight: 300 }}>
          {Config.taxClearanceCertificateStep2.firstSectionHeader}
        </Heading>
        <div className={`flex ${isTabletAndUp ? "flex-row" : "flex-column margin-right-2"}`}>
          <div className={`${isTabletAndUp ? "padding-right-1" : ""}`}>
            <span className="text-bold">{Config.taxClearanceCertificateStep2.certificationReasonLabel}</span>
          </div>
        </div>
        <div className={"margin-bottom-1"}>
          <div className={"text-wrap"}>
            <TaxClearanceCertificateIssuingAgencyDropdown
              onValidation={undefined}
              taxClearances={TaxClearanceCertificateIssuingAgencies}
              fieldName={"taxClearanceCertificateIssuingAgencies"}
              error={false}
              value={taxClearanceCertificateState.taxClearanceCertificateData.issuingAgency}
              onSelect={(value: TaxClearanceCertificateIssuingAgency | undefined): void => {
                setTaxClearanceCertificateState((prevTaxClearanceData: TaxClearanceCertificate) => {
                  return { ...prevTaxClearanceData, issuingAgency: value };
                });
              }}
              helperText={"Tax Certificate Issuing Agencies"}
            />
          </div>
        </div>
      </div>
      <hr className="desktop:margin-top-0 margin-top-4 margin-bottom-2" />
      <div data-testid="tax-clearance-certificate-business-information-header">
        <Heading level={2} data-testid={"informationMainHeader"} className="margin-bottom-4" style={{ fontWeight: 300 }}>
          {Config.taxClearanceCertificateStep2.secondSectionHeader}
        </Heading>
      </div>
      <div className={"margin-bottom-1"}>
        <div className={"margin-bottom-1"}>
          <strong>{Config.taxClearanceCertificateStep2.businessNameLabel}</strong>
          <GenericTextField
            inputWidth={"full"}
            value={taxClearanceCertificateState.taxClearanceCertificateData.businessName}
            onValidation={undefined}
            fieldName={"businessName"}
            ariaLabel={"Business Name"}
            handleChange={(value: string) => {
              setTaxClearanceCertificateState((prevTaxClearanceData: TaxClearanceCertificate) => {
                return {...prevTaxClearanceData, businessName: value};
              });
            }}
            error={false}
          />
        </div>
        <div className={"margin-bottom-1"}>
          <strong>{Config.taxClearanceCertificateStep2.entityIdLabel}</strong>
          <GenericTextField
            inputWidth={"full"}
            value={taxClearanceCertificateState.taxClearanceCertificateData.entityId}
            onValidation={undefined}
            fieldName={"entityId"}
            ariaLabel={"Entity Id"}
            handleChange={(value: string) => {
              setTaxClearanceCertificateState((prevTaxClearanceData: TaxClearanceCertificate) => {
                return {...prevTaxClearanceData, entityId: value};
              });
            }}
            numericProps={{minLength: 6, maxLength: 6}}
            error={false}
          />
        </div>
      </div>
    </>
  );
};
