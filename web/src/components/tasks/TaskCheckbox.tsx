import { AuthAlertContext } from "@/contexts/authAlertContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Checkbox, CheckboxProps } from "@mui/material";
import React, { useContext } from "react";

interface Props {
  checklistItemId: string;
  checkboxProps?: CheckboxProps;
}

export const TaskCheckbox = (props: Props) => {
  const { userData, update } = useUserData();
  const { isAuthenticated, setRegistrationModalIsVisible } = useContext(AuthAlertContext);

  const checklistItemStatus = userData?.taskItemChecklist[props.checklistItemId] ?? false;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userData) {
      return;
    }

    if (isAuthenticated !== IsAuthenticated.TRUE) {
      setRegistrationModalIsVisible(true);
      return;
    }

    update({
      ...userData,
      taskItemChecklist: {
        ...userData.taskItemChecklist,
        [props.checklistItemId]: event.target.checked,
      },
    });
  };

  return (
    <>
      <Checkbox
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        inputProps={{ "data-testid": props.checklistItemId }}
        onChange={handleChange}
        checked={checklistItemStatus}
        {...props.checkboxProps}
      />
    </>
  );
};
