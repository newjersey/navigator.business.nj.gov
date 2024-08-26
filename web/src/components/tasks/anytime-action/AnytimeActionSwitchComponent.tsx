import { AnytimeActionElement } from "@/components/tasks/anytime-action/AnytimeActionElement";
import { AnytimeActionGovernmentContractingElement } from "@/components/tasks/anytime-action/AnytimeActionGovernmentContractingElement";
import { AnytimeActionTask } from "@/lib/types/types";
import { rswitch } from "@/lib/utils/helpers";
import { ReactElement } from "react";

interface Props {
  anytimeActionTask: AnytimeActionTask;
}

export const AnytimeActionSwitchComponent = (props: Props): ReactElement => {
  return rswitch(props.anytimeActionTask.filename, {
    "government-contracting": (
      <AnytimeActionGovernmentContractingElement anytimeAction={props.anytimeActionTask} />
    ),
    default: <AnytimeActionElement anytimeAction={props.anytimeActionTask} />,
  });
};
