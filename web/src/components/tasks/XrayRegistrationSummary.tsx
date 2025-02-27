import { Task } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props {
  task?: Task;
  CMS_ONLY_disable_overlay?: boolean;
}

export const XrayRegistrationSummary = (props: Props): ReactElement => {
  console.log(props);
  return <></>;
};
