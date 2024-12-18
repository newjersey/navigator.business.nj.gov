import {ReactElement } from "react";
import {Business} from "@businessnjgovnavigator/shared/userData";
import {Heading} from "@/components/njwds-extended/Heading";

interface Props {
  CMS_ONLY_fakeBusiness?: Business;
}

export const TaxClearanceCertificateReview= (props: Props): ReactElement => {

  return (
    <>
      <div data-testid="tax-clearance-certificate-tab-header">
        <Heading level={1} className="margin-bottom-4" style={{fontWeight: 300}}>
          Check for Eligibility
        </Heading>
      </div>
      <div data-testid="tax-clearance-certificate-tab-header">
        <Heading level={2} className="margin-bottom-4" style={{fontWeight: 300}}>
          Reason for Certification
        </Heading>
      </div>
    </>
  );
}
