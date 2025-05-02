import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { TaskHeader } from "@/components/TaskHeader";
import { NeedsAccountModalWrapper } from "@/components/auth/NeedsAccountModalWrapper";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { XrayRegistrationStatus } from "@/components/tasks/xray-registration/XrayRegistrationStatus";
import { XrayRegistrationSummary } from "@/components/tasks/xray-registration/XrayRegistrationSummary";
import * as api from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { openInNewTab } from "@/lib/utils/helpers";
import { getModifiedTaskContent } from "@/lib/utils/roadmap-helpers";
import type { UserData } from "@businessnjgovnavigator/shared/userData";
import type {
  FacilityDetails,
  XrayData,
  XraySearchError,
} from "@businessnjgovnavigator/shared/xray";
import { TabContext, TabList, TabPanel } from "@mui/lab/";
import { Box, Tab } from "@mui/material";
import React, { ReactElement, useEffect, useState } from "react";

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
  const { business, refresh } = useUserData();

  const [xrayRegistrationData, setXrayRegistrationData] = useState<XrayData | undefined>(undefined);

  useEffect(() => {
    if (!business) return;

    const hasValidData = business?.xrayRegistrationData?.status;

    if (hasValidData) {
      setTabIndex(STATUS_TAB_INDEX);
      setXrayRegistrationData(business.xrayRegistrationData);
    }
  }, [business]);

  const goToRegistrationTab = (): void => {
    setTabIndex(APPLICATION_TAB_INDEX);
  };

  const onSelectTab = (event: React.SyntheticEvent, newValue: string): void => {
    const index = Number.parseInt(newValue);
    setTabIndex(index);
  };

  const allFieldsHaveValues = (facilityDetails: FacilityDetails): boolean => {
    return !!(
      facilityDetails.businessName &&
      facilityDetails.addressLine1 &&
      facilityDetails.addressZipCode
    );
  };

  const onSubmit = (facilityDetails: FacilityDetails): void => {
    if (!allFieldsHaveValues(facilityDetails)) {
      setError("FIELDS_REQUIRED");
      return;
    }

    setIsLoading(true);
    api
      .checkXrayRegistrationStatus(facilityDetails)
      .then((userData: UserData) => {
        const xrayRegistrationData =
          userData.businesses[userData.currentBusinessId].xrayRegistrationData;
        if (!xrayRegistrationData?.status && xrayRegistrationData?.machines?.length === 0) {
          setError("NOT_FOUND");
          setIsLoading(false);
          return;
        }
        setXrayRegistrationData(xrayRegistrationData);
      })
      .catch(() => {
        setError("SEARCH_FAILED");
      })
      .finally(async () => {
        refresh();
        setIsLoading(false);
      });
  };

  const onEdit = (): void => {
    setXrayRegistrationData(undefined);
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
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  marginTop: ".25rem",
                  marginLeft: ".5rem",
                }}
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
                {xrayRegistrationData && error === undefined ? (
                  <XrayRegistrationSummary
                    xrayRegistrationData={xrayRegistrationData}
                    edit={onEdit}
                    goToRegistrationTab={goToRegistrationTab}
                  />
                ) : (
                  <XrayRegistrationStatus onSubmit={onSubmit} error={error} isLoading={isLoading} />
                )}
              </div>
            </TabPanel>
          </TabContext>
        </Box>
      </div>
    </NeedsAccountModalWrapper>
  );
};
