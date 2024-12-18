import { AnytimeActionLicenseReinstatement, AnytimeActionTask } from "@/lib/types/types";
import { ReactElement } from "react";
import {
  TaxClearanceCertificatePaginator
} from "@/components/tasks/tax-clearance-certificate/TaxClearanceCertificatePaginator";

interface Props {
  anytimeAction: AnytimeActionLicenseReinstatement | AnytimeActionTask;
}

export const AnytimeActionTaxClearanceCertificateElement = (props: Props): ReactElement => {
  return (
    <div className="min-height-38rem">
      <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
        <div className="padding-top-4 padding-bottom-4 margin-x-4">
          <h1>{props.anytimeAction.name}</h1>
        </div>
        <div className="flex flex-column min-height-38rem bg-white">
          <TaxClearanceCertificatePaginator />
        </div>
      </div>
    </div>
  );
};
