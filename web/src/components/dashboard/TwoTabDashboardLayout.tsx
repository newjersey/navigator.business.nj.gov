import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { getTabId, getTabPanelId, TabPanel } from "@/components/TabPanel";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getForYouCardCount } from "@/lib/domain-logic/sidebarCardsHelpers";
import { templateEval } from "@/lib/utils/helpers";
import { Certification, Funding } from "@businessnjgovnavigator/shared/types";
import { Tab, Tabs } from "@mui/material";
import * as React from "react";
import { ReactElement, ReactNode, useEffect } from "react";

interface Props {
  firstTab: ReactElement;
  secondTab: ReactElement;
  aboveTabs: ReactElement;
  certifications: Certification[];
  fundings: Funding[];
}

export default function TwoTabDashboardLayout(props: Props): ReactElement {
  const DASHBOARD_TAB = 0;
  const FOR_YOU_TAB = 1;

  const { business, updateQueue } = useUserData();
  const [tabIndex, setTabIndex] = React.useState(DASHBOARD_TAB);
  const { Config } = useConfig();

  const handleChange = (event: React.SyntheticEvent, newValue: number): void => {
    setTabIndex(Number(newValue));
  };

  useEffect(() => {
    if (!business || !updateQueue) return;
    if (tabIndex === FOR_YOU_TAB && business.preferences.phaseNewlyChanged) {
      updateQueue.queuePreferences({ phaseNewlyChanged: false }).updateInBackground();
    }
  }, [tabIndex, business, updateQueue]);

  const tabStyling = {
    "& .MuiTabs-indicator": {
      display: "none",
    },
    "& :focus": {
      outline: "none !important",
    },
    "& .Mui-selected": {
      style: {
        color: "#FFFFFF",
      },
    },
    minHeight: "auto",
  };
  const unselectedButtonStyling = {
    textTransform: "none",
    color: "#5c5c5c !important",
    borderRadius: "8px",
    padding: "8px",
    minHeight: "44px",
  };
  const selectedButtonStyling = {
    backgroundColor: "white",
    border: "1px solid #e6e6e6",
    borderRadius: "8px",
    textTransform: "none",
    color: "#1b1b1b !important",
    padding: "8px",
    minHeight: "44px",
  };

  const getIndicator = (): ReactNode => {
    if (!business?.preferences.phaseNewlyChanged) {
      return <></>;
    }
    return (
      <span className="margin-left-1 font-body-xl text-error" data-testid="for-you-indicator">
        •
      </span>
    );
  };

  return (
    <div data-testid="two-tab-Layout" className={tabIndex === 1 ? "bg-cool-extra-light" : ""}>
      <SingleColumnContainer>
        <div className="margin-top-4">
          {props.aboveTabs}
          <hr />
        </div>
        <div className="border radius-lg border-base-lighter bg-base-extra-light margin-top-3 padding-1">
          <Tabs
            onChange={handleChange}
            aria-label="Dashboard Tabs"
            variant="fullWidth"
            value={tabIndex}
            sx={tabStyling}
          >
            <Tab
              aria-controls={getTabPanelId("dashboard", DASHBOARD_TAB)}
              id={getTabId("dashboard", DASHBOARD_TAB)}
              label={Config.dashboardDefaults.mobileFirstTabText}
              value={DASHBOARD_TAB}
              sx={tabIndex === DASHBOARD_TAB ? selectedButtonStyling : unselectedButtonStyling}
            />
            <Tab
              aria-controls={getTabPanelId("dashboard", FOR_YOU_TAB)}
              data-testid="for-you-tab"
              id={getTabId("dashboard", FOR_YOU_TAB)}
              label={
                <div className="fdr fjc">
                  {templateEval(Config.dashboardDefaults.mobileSecondTabText, {
                    count: getForYouCardCount(
                      business,
                      props.certifications,
                      props.fundings,
                    ).toString(),
                  })}
                  {getIndicator()}
                </div>
              }
              value={FOR_YOU_TAB}
              sx={tabIndex === FOR_YOU_TAB ? selectedButtonStyling : unselectedButtonStyling}
            />
          </Tabs>
        </div>
        <TabPanel activeValue={tabIndex} idPrefix="dashboard" value={DASHBOARD_TAB}>
          {props.firstTab}
        </TabPanel>
        <TabPanel activeValue={tabIndex} idPrefix="dashboard" value={FOR_YOU_TAB}>
          {props.secondTab}
        </TabPanel>
      </SingleColumnContainer>
    </div>
  );
}
