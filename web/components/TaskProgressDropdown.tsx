import React, { ReactElement, useEffect, useState } from "react";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { TaskProgress } from "@/lib/types/types";
import { Icon } from "@/components/njwds/Icon";
import { TaskProgressTagLookup } from "@/components/TaskProgressTagLookup";
import analytics from "@/lib/utils/analytics";
import { TaskDefaults } from "@/display-content/tasks/TaskDefaults";
import { ToastAlert } from "./njwds-extended/ToastAlert";
import { Button, Menu, MenuItem } from "@mui/material";
import { TaskProgressLookup } from "@/display-content/TaskProgressLookup";
import { Tag } from "./njwds-extended/Tag";

const useStyles = makeStyles(() =>
  createStyles({
    menuItem: {
      letterSpacing: "0.02857em",
    },
  })
);

interface Props {
  onSelect: (selectedTaskProgress: TaskProgress) => void;
  initialValue?: TaskProgress;
}

export const TaskProgressDropdown = (props: Props): ReactElement => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [value, setValue] = useState<TaskProgress>(props.initialValue || "NOT_STARTED");
  const [successToastIsOpen, setSuccessToastIsOpen] = useState<boolean>(false);

  useEffect(() => {
    setValue(props.initialValue || "NOT_STARTED");
  }, [props.initialValue]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
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

    setValue(newValue);
    setSuccessToastIsOpen(true);
    props.onSelect(newValue);
    close();
  };

  return (
    <div className="margin-left-neg-1">
      <ToastAlert variant="success" isOpen={successToastIsOpen} close={() => setSuccessToastIsOpen(false)}>
        {TaskDefaults.taskProgressSuccessToastBody}
      </ToastAlert>
      <Button
        style={{ whiteSpace: "nowrap" }}
        aria-controls="task-progress-status-menu"
        aria-haspopup="true"
        onClick={handleClick}
        aria-label={`Status of the current task is ${TaskProgressLookup[value].toLowerCase()}`}
      >
        {TaskProgressTagLookup[value]}
        <Icon>unfold_more</Icon>
      </Button>
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
          className={`margin-left-neg-1 ${classes.menuItem}`}
          onClick={() => handleSelect("NOT_STARTED")}
          selected={value === "NOT_STARTED"}
        >
          <Tag tagVariant="base" dataTestid="NOT_STARTED">
            {TaskProgressLookup.NOT_STARTED}
          </Tag>
        </MenuItem>
        <MenuItem
          className={`margin-left-neg-1 ${classes.menuItem}`}
          onClick={() => handleSelect("IN_PROGRESS")}
          selected={value === "IN_PROGRESS"}
        >
          <Tag tagVariant="info" dataTestid="IN_PROGRESS">
            {TaskProgressLookup.IN_PROGRESS}
          </Tag>
        </MenuItem>
        <MenuItem
          className={`margin-left-neg-1 ${classes.menuItem}`}
          onClick={() => handleSelect("COMPLETED")}
          selected={value === "COMPLETED"}
        >
          <Tag tagVariant="primary" dataTestid="COMPLETED">
            {TaskProgressLookup.COMPLETED}
          </Tag>
        </MenuItem>
      </Menu>
    </div>
  );
};
