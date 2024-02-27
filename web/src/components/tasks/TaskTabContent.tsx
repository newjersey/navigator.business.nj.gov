import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab } from "@mui/material";
import React, { ReactElement } from "react";

export interface taskTabData {
  tabTitle: string;
  tabContent: ReactElement | undefined;
}
export interface taskTabContentProps {
  onSelectTab: (event: React.SyntheticEvent, newValue: string) => void;
  tabs: taskTabData[];
  tabListLabel: string;
  currentTabIndex: number;
}

const tabStyle = {
  border: 1,
  borderBottom: 0,
  borderColor: "divider",
  fontSize: "14px",
  fontWeight: "600",
  color: "#757575",
};
export const taskTabContent = (props: taskTabContentProps): ReactElement => {
  return (
    <Box sx={{ width: "100%" }}>
      <TabContext value={props.currentTabIndex.toString()}>
        <Box>
          <TabList
            onChange={props.onSelectTab}
            aria-label={props.tabListLabel}
            sx={{ borderBottom: 1, borderColor: "divider", marginTop: ".25rem", marginLeft: ".5rem" }}
          >
            {props.tabs.map((tab, index) => {
              return <Tab value={index.toString()} sx={tabStyle} label={tab.tabTitle} key={index} />;
            })}
          </TabList>
        </Box>
        {props.tabs.map((tab, index) => {
          return (
            <TabPanel value={index.toString()} key={index} sx={{ paddingX: 0 }}>
              {tab.tabContent}
            </TabPanel>
          );
        })}
      </TabContext>
    </Box>
  );
};
