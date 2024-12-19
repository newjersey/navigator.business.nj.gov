import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getForYouCardCount } from "@/lib/domain-logic/sidebarCardsHelpers";
import { Certification, Funding } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { TabContext, TabList, TabPanel } from "@mui/lab/";
import Tab from "@mui/material/Tab";
import * as React from "react";
import { ReactElement, ReactNode, useEffect } from "react";

interface Props {
  firstTab: ReactElement<any>;
  secondTab: ReactElement<any>;
  aboveTabs: ReactElement<any>;
  certifications: Certification[];
  fundings: Funding[];
}

export default function TwoTabDashboardLayout(props: Props): ReactElement<any> {
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
      updateQueue.queuePreferences({ phaseNewlyChanged: false }).update();
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
        <TabContext value={tabIndex.toString()}>
          <div className="border radius-lg border-base-lighter bg-base-extra-light margin-top-3 padding-1">
            <TabList onChange={handleChange} aria-label="Dashboard Tabs" variant="fullWidth" sx={tabStyling}>
              <Tab
                label={Config.dashboardDefaults.mobileFirstTabText}
                value={DASHBOARD_TAB.toString()}
                sx={tabIndex === DASHBOARD_TAB ? selectedButtonStyling : unselectedButtonStyling}
              />
              <Tab
                data-testid="for-you-tab"
                label={
                  <div className="fdr fjc">
                    {templateEval(Config.dashboardDefaults.mobileSecondTabText, {
                      count: getForYouCardCount(business, props.certifications, props.fundings).toString(),
                    })}
                    {getIndicator()}
                  </div>
                }
                value={FOR_YOU_TAB.toString()}
                sx={tabIndex === FOR_YOU_TAB ? selectedButtonStyling : unselectedButtonStyling}
              />
            </TabList>
          </div>
          <TabPanel value="0">{props.firstTab}</TabPanel>
          <TabPanel value="1">{props.secondTab}</TabPanel>
        </TabContext>
      </SingleColumnContainer>
    </div>
  );
}
