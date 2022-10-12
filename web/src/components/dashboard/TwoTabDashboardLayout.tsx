import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { filterCertifications } from "@/lib/domain-logic/filterCertifications";
import { filterFundings } from "@/lib/domain-logic/filterFundings";
import { getVisibleCertifications } from "@/lib/domain-logic/getVisibleCertifications";
import { getVisibleFundings } from "@/lib/domain-logic/getVisibleFundings";
import { Certification, Funding } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/operatingPhase";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { TabContext, TabList, TabPanel } from "@mui/lab/";
import Tab from "@mui/material/Tab";
import * as React from "react";
import { ReactElement } from "react";
import { SingleColumnContainer } from "../njwds/SingleColumnContainer";

interface Props {
  firstTab: ReactElement;
  secondTab: ReactElement;
  certifications: Certification[];
  fundings: Funding[];
}

export default function TwoTabDashboardLayout({ firstTab, secondTab, certifications, fundings }: Props) {
  const { userData } = useUserData();
  const [tabIndex, setTabIndex] = React.useState(0);
  const { Config } = useConfig();
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(Number(newValue));
  };

  const tabStyling = {
    "& .MuiTabs-indicator": {
      display: "none",
    },
    "& :focus": {
      outline: "none !important",
    },
    "& .Mui-selected": {
      style: {
        color: "white",
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

  const getContentWithCardCount = () => {
    let count = 0;
    if (LookupOperatingPhaseById(userData?.profileData.operatingPhase).displayCertifications) {
      count += getVisibleCertifications(
        filterCertifications(certifications, userData as UserData),
        userData as UserData
      ).length;
    }

    if (LookupOperatingPhaseById(userData?.profileData.operatingPhase).displayFundings) {
      count += getVisibleFundings(
        filterFundings(fundings, userData as UserData),
        userData as UserData
      ).length;
    }

    if (userData?.preferences.visibleSidebarCards.length) {
      count += userData?.preferences.visibleSidebarCards.length;
    }

    return templateEval(Config.dashboardDefaults.mobileSecondTabText, {
      count: count.toString(),
    });
  };

  return (
    <div data-testid="two-tab-Layout" className={tabIndex === 1 ? "bg-cool-extra-light" : ""}>
      <SingleColumnContainer>
        <TabContext value={tabIndex.toString()}>
          <div className="border radius-lg border-base-lighter bg-base-extra-light margin-y-4 padding-1">
            <TabList onChange={handleChange} aria-label="Dashboard Tabs" variant="fullWidth" sx={tabStyling}>
              <Tab
                label={Config.dashboardDefaults.mobileFirstTabText}
                value="0"
                sx={tabIndex === 0 ? selectedButtonStyling : unselectedButtonStyling}
              />
              <Tab
                label={getContentWithCardCount()}
                value="1"
                sx={tabIndex === 1 ? selectedButtonStyling : unselectedButtonStyling}
              />
            </TabList>
          </div>
          <TabPanel value="0">{firstTab}</TabPanel>
          <TabPanel value="1">{secondTab}</TabPanel>
        </TabContext>
      </SingleColumnContainer>
    </div>
  );
}
