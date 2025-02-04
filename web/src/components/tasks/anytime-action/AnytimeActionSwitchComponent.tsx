import { AnytimeActionElement } from "@/components/tasks/anytime-action/AnytimeActionElement";
import { AnytimeActionGovernmentContractingElement } from "@/components/tasks/anytime-action/AnytimeActionGovernmentContractingElement";
import { AnytimeActionTaxClearanceCertificateElement } from "@/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificateElement";
import { AnytimeActionTask } from "@/lib/types/types";
import { rswitch } from "@/lib/utils/helpers";
import { ReactElement } from "react";

interface Props {
  anytimeActionTask: AnytimeActionTask;
}

export const AnytimeActionSwitchComponent = (props: Props): ReactElement => {
  const taxClearanceCertificateEnabled = process.env.FEATURE_TAX_CLEARANCE_CERTIFICATE === "true";

  if (taxClearanceCertificateEnabled) {
    return rswitch(props.anytimeActionTask.filename, {
      "government-contracting": (
        <AnytimeActionGovernmentContractingElement anytimeAction={props.anytimeActionTask} />
      ),
      "tax-clearance-certificate": (
        <AnytimeActionTaxClearanceCertificateElement
          anytimeAction={props.anytimeActionTask}
        />
      ),
      default: <AnytimeActionElement anytimeAction={props.anytimeActionTask} />,
    });
  }else {
    return rswitch(props.anytimeActionTask.filename, {
      "government-contracting": (
        <AnytimeActionGovernmentContractingElement anytimeAction={props.anytimeActionTask}/>
      ),
      default: <AnytimeActionElement anytimeAction={props.anytimeActionTask}/>,
    });
  }
};
