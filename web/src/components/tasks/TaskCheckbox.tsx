import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { AuthAlertContext } from "@/pages/_app";
import { Checkbox } from "@mui/material";
import React, { useContext } from "react";

interface Props {
  checklistItemId: string;
}

export const TaskCheckbox = (props: Props) => {
  const { userData, update } = useUserData();
  const { isAuthenticated, setModalIsVisible } = useContext(AuthAlertContext);

  const checklistItemStatus = userData?.taskItemChecklist[props.checklistItemId] ?? false;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userData) return;

    if (isAuthenticated !== IsAuthenticated.TRUE) {
      setModalIsVisible(true);
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
      <Checkbox onChange={handleChange} checked={checklistItemStatus} />
    </>
  );
};
