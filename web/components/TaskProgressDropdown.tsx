import React, { ReactElement, useEffect, useState } from "react";
import { Button, createStyles, makeStyles, Menu, MenuItem } from "@material-ui/core";
import { TaskProgress } from "@/lib/types/types";
import { Icon } from "@/components/njwds/Icon";
import { TagInProgress } from "@/components/njwds-extended/TagInProgress";
import { TagCompleted } from "@/components/njwds-extended/TagCompleted";
import { TagNotStarted } from "@/components/njwds-extended/TagNotStarted";
import { TaskProgressTagLookup } from "@/components/TaskProgressTagLookup";

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

  useEffect(() => {
    setValue(props.initialValue || "NOT_STARTED");
  }, [props.initialValue]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const close = () => {
    setAnchorEl(null);
  };

  const handleSelect = (newValue: TaskProgress): void => {
    setValue(newValue);
    props.onSelect(newValue);
    close();
  };

  return (
    <div className="margin-left-neg-1">
      <Button
        style={{ whiteSpace: "nowrap" }}
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        {TaskProgressTagLookup[value]}
        <Icon>unfold_more</Icon>
      </Button>
      <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={close}>
        <MenuItem
          className={`margin-left-neg-1 ${classes.menuItem}`}
          onClick={() => handleSelect("NOT_STARTED")}
          selected={value === "NOT_STARTED"}
        >
          <TagNotStarted />
        </MenuItem>
        <MenuItem
          className={`margin-left-neg-1 ${classes.menuItem}`}
          onClick={() => handleSelect("IN_PROGRESS")}
          selected={value === "IN_PROGRESS"}
        >
          <TagInProgress />
        </MenuItem>
        <MenuItem
          className={`margin-left-neg-1 ${classes.menuItem}`}
          onClick={() => handleSelect("COMPLETED")}
          selected={value === "COMPLETED"}
        >
          <TagCompleted />
        </MenuItem>
      </Menu>
    </div>
  );
};
