import {ReactElement, useContext} from "react";
import {Business} from "@businessnjgovnavigator/shared/userData";
import {Heading} from "@/components/njwds-extended/Heading";
import {useConfig} from "@/lib/data-hooks/useConfig";
import {useMediaQuery} from "@mui/material";
import {MediaQueries} from "@/lib/PageSizes";
import {useUserData} from "@/lib/data-hooks/useUserData";
import {TaxCertificateContext} from "@/contexts/taxCertificateContext";
import {useMountEffectWhenDefined} from "@/lib/utils/helpers";

interface Props {
  CMS_ONLY_fakeBusiness?: Business;
}

export const TaxClearanceCertificateReview= (props: Props): ReactElement => {
  const { state, setAddressData } = useContext(TaxCertificateContext);
  const {Config} = useConfig();
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const userDataFromHook = useUserData();
  const business = props.CMS_ONLY_fakeBusiness ?? userDataFromHook.business;

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
      <div data-testid="tax-clearance-certificate-review-main-header">
        <Heading level={1} className="margin-bottom-4" style={{fontWeight: 300}}>
          {Config.taxClearanceCertificateTask.reviewSectionMainHeaderText}
        </Heading>
      </div>
      <div data-testid="tax-clearance-certificate-review-first-section-header">
        <Heading level={2} className="margin-bottom-4" style={{fontWeight: 300}}>
          {Config.taxClearanceCertificateTask.certificationReasonLabel}
        </Heading>

        <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div className="text-bold grid-col flex-5">
            {Config.taxClearanceCertificateTask.taxCertificateAgencyLabel}
          </div>
          <div className={"grid-col flex-7"}>
            Something
          </div>
        </div>
        <hr className="margin-bottom-3 margin-top-3"/>
      </div>
      <div data-testid="tax-clearance-certificate-review-second-section-header">
        <Heading level={2} className="margin-bottom-4" style={{fontWeight: 300}}>
          {Config.taxClearanceCertificateTask.reviewSectionSecondSectionHeaderText}
        </Heading>

        <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div className="text-bold grid-col flex-5">
            {Config.taxClearanceCertificateTask.businessNameLabel}
          </div>
          <div className={"grid-col flex-7"}>
            Something
          </div>
        </div>
        <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div className="text-bold grid-col flex-5">
            {`${Config.taxClearanceCertificateTask.entityIdLabel} ${Config.taxClearanceCertificateTask.entityIdSubLabel}`}`
          </div>
          <div className={"grid-col flex-7"}>
            Something
          </div>
        </div>
        <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div className="text-bold grid-col flex-5">
            {Config.taxClearanceCertificateTask.reviewSectionAddressLabel}
          </div>
          <div className={"grid-col flex-7"}>
            Something
          </div>
        </div>
        <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div className="text-bold grid-col flex-5">
            {Config.taxClearanceCertificateTask.taxIdLabel}
          </div>
          <div className={"grid-col flex-7"}>
            Something
          </div>
        </div>
        <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div className="text-bold grid-col flex-5">
            {Config.taxClearanceCertificateTask.taxPinLabel}
          </div>
          <div className={"grid-col flex-7"}>
            Something
          </div>
        </div>
      </div>
    </>
  );
}
