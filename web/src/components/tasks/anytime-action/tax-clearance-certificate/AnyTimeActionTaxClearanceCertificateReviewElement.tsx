import { Heading } from "@/components/njwds-extended/Heading";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import {ReactElement, useContext} from "react";
import { getMergedConfig } from "@/contexts/configContext";
import {TaxClearanceCertificateContext} from "@/contexts/taxClearanceCertificateContext";
import {UnStyledButton} from "@/components/njwds-extended/UnStyledButton";

export const AnyTimeActionTaxClearanceCertificateReviewElement = (): ReactElement => {
  const { taxClearanceCertificateState } = useContext(TaxClearanceCertificateContext);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const Config = getMergedConfig();

  const completeAddress = (): string => {

      let streetAddress = "";

      if(taxClearanceCertificateState?.taxClearanceCertificateData?.address?.addressLine1){
        streetAddress +=`${taxClearanceCertificateState?.taxClearanceCertificateData?.address?.addressLine1}, `;
      }
      if(taxClearanceCertificateState.taxClearanceCertificateData.address?.addressLine2){
        streetAddress += `${taxClearanceCertificateState?.taxClearanceCertificateData?.address?.addressLine2}, `;
      }

      if(taxClearanceCertificateState.taxClearanceCertificateData.address?.addressCity){
        streetAddress+= `${taxClearanceCertificateState?.taxClearanceCertificateData?.address?.addressCity}, `;
      }

      if(taxClearanceCertificateState.taxClearanceCertificateData.address?.addressState?.shortCode){
        streetAddress+= `${taxClearanceCertificateState?.taxClearanceCertificateData?.address?.addressState?.shortCode}, `;
      }

    if(taxClearanceCertificateState.taxClearanceCertificateData.address?.addressZipCode){
      streetAddress+= `${taxClearanceCertificateState?.taxClearanceCertificateData?.address?.addressZipCode}`;
    }

      return streetAddress;
  };

  return (
    <>
      <div>
        <div className="flex">
          <div className="grid-col flex-5">
            <Heading level={1} data-testid={"reviewMainHeader"} className="margin-bottom-4" style={{fontWeight: 300}}>
              {Config.taxClearanceCertificateStep3.mainTitleHeader}
            </Heading>
          </div>
          <div className="margin-top-05">
          <UnStyledButton
            onClick={(): void => {
            }}
            isUnderline
            dataTestid="edit-tax-clearance-information"
            ariaLabel={`tax clearance edit button`}
          >
            {Config.taxClearanceCertificateStep3.editButtonText}
          </UnStyledButton>
          </div>
        </div>
      </div>
      <div>
        <Heading level={2} data-testid={"certificationReasonHeader"} className="margin-bottom-4" style={{ fontWeight: 300 }}>
          {Config.taxClearanceCertificateStep3.firstSectionHeader}
        </Heading>

        <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div data-testid={"taxIssuingAgencyLabel"} className="text-bold grid-col flex-5">
            {Config.taxClearanceCertificateStep3.certificationReasonLabel}
          </div>
          <div data-testid={"taxIssuingAgencyData"} className={"grid-col flex-7"}>
            {taxClearanceCertificateState ? taxClearanceCertificateState.taxClearanceCertificateData.issuingAgency?.displayName : "" }
          </div>
        </div>
        <hr className="margin-bottom-3 margin-top-3" />
      </div>
      <div>
        <Heading level={2} data-testid={"businessSectionHeader"} className="margin-bottom-4" style={{ fontWeight: 300 }}>
          {Config.taxClearanceCertificateStep3.secondSectionHeader}
        </Heading>

        <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div data-testid={"businessNameLabel"} className="text-bold grid-col flex-5">
            {Config.taxClearanceCertificateStep3.businessNameLabel}
          </div>
          <div data-testid={"businessNameData"} className={"grid-col flex-7"}>
            {taxClearanceCertificateState  ? taxClearanceCertificateState.taxClearanceCertificateData.businessName : "" }
          </div>
        </div>
        <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div data-testid={"entityIdLabel"} className="text-bold grid-col flex-5">
            {Config.taxClearanceCertificateStep3.entityIdLabel}
          </div>
          <div data-testid={"entityIdData"} className={"grid-col flex-7"}>
            {taxClearanceCertificateState ? taxClearanceCertificateState.taxClearanceCertificateData.entityId : "" }
          </div>
        </div>
        <div  className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div data-testid={"addressLabel"} className="text-bold grid-col flex-5">
            {Config.taxClearanceCertificateStep3.addressLabel}
          </div>
          <div data-testid={"addressData"} className={"grid-col flex-7"}>
            {completeAddress()}
          </div>
        </div>
        <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div data-testid={"taxIdLabel"} className="text-bold grid-col flex-5">{Config.taxClearanceCertificateStep3.stateTaxIdLabel}</div>
          <div data-testid={"taxIdData"} className={"grid-col flex-7"}>
            {taxClearanceCertificateState  ? taxClearanceCertificateState.taxClearanceCertificateData.taxId : "" }
          </div>
        </div>
        <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div data-testid={"taxPinLabel"} className="text-bold grid-col flex-5">{Config.taxClearanceCertificateStep3.taxPinLabel}</div>
          <div data-testid={"taxPinData"} className={"grid-col flex-7"}>
            {taxClearanceCertificateState ? taxClearanceCertificateState.taxClearanceCertificateData.taxPin : "" }
          </div>
        </div>
      </div>
    </>
  );
};
