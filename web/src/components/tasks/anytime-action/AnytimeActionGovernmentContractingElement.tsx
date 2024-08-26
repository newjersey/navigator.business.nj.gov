import { Alert } from "@/components/njwds-extended/Alert";
import { GovernmentContractorPaginator } from "@/components/tasks/government-contracting/GovernmentContractingPaginator";
import { AnytimeActionLicenseReinstatement, AnytimeActionTask } from "@/lib/types/types";
import Link from "next/link";
import { ReactElement } from "react";

interface Props {
  anytimeAction: AnytimeActionLicenseReinstatement | AnytimeActionTask;
}

export const AnytimeActionGovernmentContractingElement = (props: Props): ReactElement => {
  return (
    <div className="minh-38">
      <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
        <div className="padding-top-4 padding-bottom-4 margin-x-4">
          <h1>{props.anytimeAction.name}</h1>
        </div>
        <div className="flex flex-column minh-38 bg-white">
          <Alert className="margin-x-4" variant={"warning"}>
            {"To contract with the government, you need to have your "}
            <Link href={"https://www.njconsumeraffairs.gov/ocp/Pages/hic.aspx"}>
              Home Improvement Contractor License
            </Link>
          </Alert>
          <GovernmentContractorPaginator />
        </div>
      </div>
    </div>
  );
};
