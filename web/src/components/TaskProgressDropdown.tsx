import { Tag } from "@/components/njwds-extended/Tag";
import { Icon } from "@/components/njwds/Icon";
import { TaskProgressTagLookup } from "@/components/TaskProgressTagLookup";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { TaskProgress } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Button as MuiButton, Menu, MenuItem } from "@mui/material";
import React, { ReactElement, useContext, useState } from "react";

interface Props {
  onSelect: (selectedTaskProgress: TaskProgress) => void;
  value: TaskProgress;
}

export const TaskProgressDropdown = (props: Props): ReactElement => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { isAuthenticated, setModalIsVisible } = useContext(AuthAlertContext);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isAuthenticated !== IsAuthenticated.TRUE) {
      setModalIsVisible(true);
      return;
    }
    analytics.event.task_status.click.dropdown_appears();
    setAnchorEl(event.currentTarget);
  };

  const close = () => {
    setAnchorEl(null);
  };

  const handleSelect = (newValue: TaskProgress): void => {
    switch (newValue) {
      case "NOT_STARTED":
        analytics.event.task_status_dropdown.click_not_started.selected_not_started_status();
        break;
      case "IN_PROGRESS":
        analytics.event.task_status_dropdown.click_in_progress.selected_in_progress_status();
        break;
      case "COMPLETED":
        analytics.event.task_status_dropdown.click_completed.selected_completed_status();
        break;
    }

    props.onSelect(newValue);
    close();
  };

  return (
    <div className="margin-left-neg-1">
      <MuiButton
        style={{ whiteSpace: "nowrap" }}
        aria-controls="task-progress-status-menu"
        aria-haspopup="true"
        onClick={handleClick}
        aria-label={`Status of the current task is ${Config.taskProgress[props.value].toLowerCase()}`}
      >
        {TaskProgressTagLookup[props.value]}
        <Icon>unfold_more</Icon>
      </MuiButton>
      <Menu
        id="task-progress-status-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={close}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem
          className="margin-left-neg-1"
          onClick={() => handleSelect("NOT_STARTED")}
          selected={props.value === "NOT_STARTED"}
        >
          <Tag tagVariant="base" dataTestid="NOT_STARTED" fixedWidth>
            {Config.taskProgress.NOT_STARTED}
          </Tag>
        </MenuItem>
        <MenuItem
          className="margin-left-neg-1"
          onClick={() => handleSelect("IN_PROGRESS")}
          selected={props.value === "IN_PROGRESS"}
        >
          <Tag tagVariant="info" dataTestid="IN_PROGRESS" fixedWidth>
            {Config.taskProgress.IN_PROGRESS}
          </Tag>
        </MenuItem>
        <MenuItem
          className="margin-left-neg-1"
          onClick={() => handleSelect("COMPLETED")}
          selected={props.value === "COMPLETED"}
        >
          <Tag tagVariant="primary" dataTestid="COMPLETED" fixedWidth>
            {Config.taskProgress.COMPLETED}
          </Tag>
        </MenuItem>
      </Menu>
    </div>
  );
};
