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
  // TODO: when the feature flag is removed, the tax clearance filename can be added to the switch statement
  // when this happens, the content in the markdown file will no longer render; let content know, and advise them to
  // delete the content in tax-clearance-certificate.md
  const isTaxClearanceCertificateEnabled =
    process.env.FEATURE_TAX_CLEARANCE_CERTIFICATE === "true";
  if (
    isTaxClearanceCertificateEnabled &&
    props.anytimeActionTask.filename === "tax-clearance-certificate"
  )
    return (
      <AnytimeActionTaxClearanceCertificateElement
        anytimeAction={props.anytimeActionTask}
      />
    );

  return rswitch(props.anytimeActionTask.filename, {
    "government-contracting": (
      <AnytimeActionGovernmentContractingElement
        anytimeAction={props.anytimeActionTask}
      />
    ),
    default: <AnytimeActionElement anytimeAction={props.anytimeActionTask} />,
  });
};
