import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { TaskHeader } from "@/components/TaskHeader";
import { NeedsAccountModalWrapper } from "@/components/auth/NeedsAccountModalWrapper";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { XrayRegistrationStatus } from "@/components/tasks/XrayRegistrationStatus";
import { XrayRegistrationSummary } from "@/components/tasks/XrayRegistrationSummary";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { Task } from "@/lib/types/types";
import { openInNewTab } from "@/lib/utils/helpers";
import { getModifiedTaskContent } from "@/lib/utils/roadmap-helpers";
import { FacilityDetails, XraySearchError } from "@businessnjgovnavigator/shared/xray";
import { TabContext, TabList, TabPanel } from "@mui/lab/";
import { Box, Tab } from "@mui/material";
import React, { ReactElement, useState } from "react";

interface Props {
  task: Task;
  CMS_ONLY_disable_overlay?: boolean;
}

const APPLICATION_TAB_INDEX = 0;
const STATUS_TAB_INDEX = 1;

export const XrayRegistrationTask = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const callToActionLink = getModifiedTaskContent(roadmap, props.task, "callToActionLink");
  const [tabIndex, setTabIndex] = useState(APPLICATION_TAB_INDEX);
  const [error, setError] = useState<XraySearchError | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { Config } = useConfig();

  const onSelectTab = (event: React.SyntheticEvent, newValue: string): void => {
    const index = Number.parseInt(newValue);
    setTabIndex(index);
  };

  const onSubmit = (facilityDetails: FacilityDetails): void => {
    setIsLoading(true);
    if (!facilityDetails.businessName || !facilityDetails.addressLine1 || !facilityDetails.addressZipCode) {
      setError("FIELDS_REQUIRED");
    }
    setIsLoading(false);
    console.log(facilityDetails);
  };

  const tabStyle = {
    border: 1,
    borderBottom: 0,
    borderColor: "divider",
    fontSize: "14px",
    fontWeight: "600",
    color: "#757575",
  };

  return (
    <NeedsAccountModalWrapper CMS_ONLY_disable_overlay={props.CMS_ONLY_disable_overlay}>
      <div className="flex flex-column">
        <TaskHeader task={props.task} />
        <Box sx={{ width: "100%" }}>
          <TabContext value={tabIndex.toString()}>
            <Box>
              <TabList
                onChange={onSelectTab}
                aria-label="X-Ray Registration task"
                sx={{ borderBottom: 1, borderColor: "divider", marginTop: ".25rem", marginLeft: ".5rem" }}
              >
                <Tab
                  value="0"
                  sx={tabStyle}
                  label={Config.xrayRegistrationTask.tab1Text}
                  data-testid={"start-application-tab"}
                />
                <Tab
                  value="1"
                  sx={tabStyle}
                  label={Config.xrayRegistrationTask.tab2Text}
                  data-testid={"check-status-tab"}
                />
              </TabList>
            </Box>
            <TabPanel value="0">
              <div className="margin-top-3">
                <UnlockedBy task={props.task} />
                <Content>{props.task.summaryDescriptionMd || ""}</Content>
                <Content>{getModifiedTaskContent(roadmap, props.task, "contentMd")}</Content>
                <HorizontalLine />
                <div className="h6-styling">{Config.xrayRegistrationTask.issuingAgency}</div>
              </div>
              <CtaContainer>
                <ActionBarLayout>
                  <div className="margin-top-2 mobile-lg:margin-top-0">
                    <SecondaryButton
                      isColor="primary"
                      onClick={(): void => {
                        //analytics.event.task_elevator_registration.click.elevator_registration_button_click_update();
                        setTabIndex(STATUS_TAB_INDEX);
                      }}
                      dataTestId="cta-secondary"
                    >
                      {Config.xrayRegistrationTask.callToActionSecondaryText}
                    </SecondaryButton>
                  </div>
                  <PrimaryButton
                    isColor="primary"
                    onClick={(): void => {
                      //analytics.event.task_elevator_registration.click.elevator_registration_button_click_register();
                      openInNewTab(callToActionLink);
                    }}
                    isRightMarginRemoved
                    dataTestId="cta-primary"
                  >
                    {Config.xrayRegistrationTask.callToActionPrimaryText}
                  </PrimaryButton>
                </ActionBarLayout>
              </CtaContainer>
            </TabPanel>
            <TabPanel value="1">
              <div className="margin-top-3">
                <XrayRegistrationSummary />
                <XrayRegistrationStatus onSubmit={onSubmit} error={error} isLoading={isLoading} />
              </div>
            </TabPanel>
          </TabContext>
        </Box>
      </div>
    </NeedsAccountModalWrapper>
  );
};
