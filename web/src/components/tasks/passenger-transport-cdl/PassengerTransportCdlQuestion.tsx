import React from "react";
import { useUserData } from "@/lib/data-hooks/useUserData";

interface Props {
  taskId: string;
  onSubmit: (event?: React.FormEvent<HTMLFormElement>) => void;
  formFuncWrapper: (
    onSubmitFunc: () => void | Promise<void>,
    onChangeFunc?:
      | ((isValid: boolean, errors: unknown[], pageChange: boolean) => void | Promise<void>)
      | undefined,
  ) => void;
  // CMS_ONLY_disable_error?: boolean;
}

export const PassengerTransportCdlQuestion = (props: Props) => {
  const { business, updateQueue } = useUserData();
  const [radioValue1, setRadioValue1] = React.useState<boolean | undefined>(
    business?.roadmapTaskData?.manageBusinessVehicles,
  );
  const [radioValue2, setRadioValue2] = React.useState<boolean | undefined>(
    business?.roadmapTaskData?.manageBusinessVehicles,
  );

  console.log(setRadioValue1, setRadioValue2);
  props.formFuncWrapper(() => {
    updateQueue?.queueTaskProgress({ [props.taskId]: "COMPLETED" });
    updateQueue?.queueRoadmapTaskData({ manageBusinessVehicles: radioValue1 });
    updateQueue?.queueRoadmapTaskData({ manageBusinessVehicles: radioValue2 });

    updateQueue?.update();
  });

  return (
    <div className="bg-accent-cooler-50 padding-205 radius-md">
      <form onSubmit={props.onSubmit}></form>
    </div>
  );
};
