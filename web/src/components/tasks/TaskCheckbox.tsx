import { AuthAlertContext } from "@/contexts/authAlertContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Checkbox, CheckboxProps } from "@mui/material";
import React, { ReactElement, useContext } from "react";

interface Props {
  checklistItemId: string;
  checkboxProps?: CheckboxProps;
}

export const TaskCheckbox = (props: Props): ReactElement => {
  const { updateQueue } = useUserData();
  const userData = updateQueue?.current();
  const { isAuthenticated, setRegistrationModalIsVisible } = useContext(AuthAlertContext);

  const checklistItemStatus = userData?.taskItemChecklist[props.checklistItemId] ?? false;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (!updateQueue) {
      return;
    }

    if (isAuthenticated !== IsAuthenticated.TRUE) {
      setRegistrationModalIsVisible(true);
      return;
    }

    updateQueue
      .queueTaskItemChecklistData({
        [props.checklistItemId]: event.target.checked,
      })
      .update();
  };

  return (
    <Checkbox onChange={handleChange} checked={checklistItemStatus} data-testid={props.checklistItemId} />
  );
};
