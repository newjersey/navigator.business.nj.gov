import { Heading } from "@/components/njwds-extended/Heading";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { ReactElement  } from "react";

export const AnyTimeActionTaxClearanceCertificateReviewElement = (): ReactElement => {
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  const completeAddress = (): string => {
      return `123 Main St, Suite 100, Trenton, NJ 08608`;
  };

  return (
    <>
      <div>
        <Heading level={1} data-testid={"reviewMainHeader"} className="margin-bottom-4" style={{ fontWeight: 300 }}>
          Check Eligibility
        </Heading>
      </div>
      <div>
        <Heading level={2} data-testid={"certificationReasonHeader"} className="margin-bottom-4" style={{ fontWeight: 300 }}>
          Reason for Certification
        </Heading>

        <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div data-testid={"taxIssuingAgencyLabel"} className="text-bold grid-col flex-5">
            What agency is requesting the Tax Clearance Certificate?
          </div>
          <div data-testid={"taxIssuingAgencyData"} className={"grid-col flex-7"}>
            Agency of Choice
          </div>
        </div>
        <hr className="margin-bottom-3 margin-top-3" />
      </div>
      <div>
        <Heading level={2} data-testid={"businessSectionHeader"} className="margin-bottom-4" style={{ fontWeight: 300 }}>
          Business Information
        </Heading>

        <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div data-testid={"businessNameLabel"} className="text-bold grid-col flex-5">
            Business Name
          </div>
          <div data-testid={"businessNameData"} className={"grid-col flex-7"}>
            Business Name Data
          </div>
        </div>
        <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div data-testid={"entityIdLabel"} className="text-bold grid-col flex-5">
            Entity ID (Corporate Number)
          </div>
          <div data-testid={"entityIdData"} className={"grid-col flex-7"}>
            1111
          </div>
        </div>
        <div  className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div data-testid={"addressLabel"} className="text-bold grid-col flex-5">
            Address
          </div>
          <div data-testid={"addressData"} className={"grid-col flex-7"}>
            {completeAddress()}
          </div>
        </div>
        <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div data-testid={"taxIdLabel"} className="text-bold grid-col flex-5">NJ State Tax ID</div>
          <div data-testid={"taxIdData"} className={"grid-col flex-7"}>
            Tax Id
          </div>
        </div>
        <div className={`${isTabletAndUp ? "grid-row" : "display-block"} margin-top-1`}>
          <div data-testid={"taxPinLabel"} className="text-bold grid-col flex-5">Tax Pin</div>
          <div data-testid={"taxPinData"} className={"grid-col flex-7"}>
            Tax Pin Data
          </div>
        </div>
      </div>
    </>
  );
};
