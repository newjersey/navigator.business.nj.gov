import { Industry } from "@/components/data-fields/Industry";
import { TaskHeader } from "@/components/TaskHeader";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { Task } from "@businessnjgovnavigator/shared/types";
import { ReactElement } from "react";

type Props = {
  task: Task;
};

export const SelectIndustryTask = (props: Props): ReactElement => {
  const { state: formContextState } = useFormContextHelper(createDataFormErrorMap());
  return (
    <>
      <TaskHeader task={props.task} />
      <DataFormErrorMapContext.Provider value={formContextState}>
        <Industry />
      </DataFormErrorMapContext.Provider>
    </>
  );
};
