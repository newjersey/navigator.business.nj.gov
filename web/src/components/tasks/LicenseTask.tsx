import { NeedsAccountModalWrapper } from "@/components/auth/NeedsAccountModalWrapper";
import { Content } from "@/components/Content";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { Icon } from "@/components/njwds/Icon";
import { TaskHeader } from "@/components/TaskHeader";
import { CheckLicenseStatus } from "@/components/tasks/CheckLicenseStatus";
import { LicenseDetailReceipt } from "@/components/tasks/LicenseDetailReceipt";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import * as api from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { LicenseSearchError, TaskWithLicenseTaskId } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { openInNewTab } from "@/lib/utils/helpers";
import { getModifiedTaskContent } from "@/lib/utils/roadmap-helpers";
import {
  LicenseDetails,
  LicenseSearchNameAndAddress,
  taskIdLicenseNameMapping,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { TabContext, TabList, TabPanel } from "@mui/lab/";
import { Box, Tab } from "@mui/material";
import React, { ReactElement, useEffect, useState } from "react";

interface Props {
  task: TaskWithLicenseTaskId;
  CMS_ONLY_disable_overlay?: boolean;
}

const APPLICATION_TAB_INDEX = 0;
const STATUS_TAB_INDEX = 1;

export const LicenseTask = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const callToActionLink = getModifiedTaskContent(roadmap, props.task, "callToActionLink");
  const [tabIndex, setTabIndex] = useState(APPLICATION_TAB_INDEX);
  const [error, setError] = useState<LicenseSearchError | undefined>(undefined);
  const [licenseDetails, setLicenseDetails] = useState<LicenseDetails | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { business, refresh } = useUserData();
  const { Config } = useConfig();

  const licenseNameForTask = taskIdLicenseNameMapping[props.task.id];
  const hasCompletedSearch = !!licenseDetails?.lastUpdatedISO;

  const allFieldsHaveValues = (nameAndAddress: LicenseSearchNameAndAddress): boolean => {
    return !!(nameAndAddress.name && nameAndAddress.addressLine1 && nameAndAddress.zipCode);
  };

  useEffect(() => {
    if (!business) return;
    const licenseDetailsReceived =
      business.licenseData?.licenses?.[licenseNameForTask]?.lastUpdatedISO;

    if (!licenseDetailsReceived && business.licenseData?.lastUpdatedISO) {
      setError("NOT_FOUND");
      return;
    }

    if (licenseDetailsReceived) {
      setTabIndex(STATUS_TAB_INDEX);
      setLicenseDetails(business.licenseData?.licenses?.[licenseNameForTask]);
    }
  }, [licenseNameForTask, business]);

  const onSelectTab = (event: React.SyntheticEvent, newValue: string): void => {
    const index = Number.parseInt(newValue);
    if (index === APPLICATION_TAB_INDEX) {
      analytics.event.task_tab_start_application.click.view_application_tab();
    } else if (index === STATUS_TAB_INDEX) {
      analytics.event.task_tab_check_status.click.view_status_tab();
    }

    setTabIndex(index);
  };

  const onEdit = (): void => {
    setLicenseDetails(undefined);
  };

  const onSubmit = (nameAndAddress: LicenseSearchNameAndAddress): void => {
    if (!business || !business.profileData.industryId) return;

    if (!allFieldsHaveValues(nameAndAddress)) {
      setError("FIELDS_REQUIRED");
      return;
    }

    setIsLoading(true);
    api
      .checkLicenseStatus(nameAndAddress)
      .then((result: UserData) => {
        const resultLicenseData =
          result.businesses[result.currentBusinessId]?.licenseData?.licenses?.[licenseNameForTask];

        if (!resultLicenseData) {
          analytics.event.task_address_form.response.fail_application_not_found();
          setError("NOT_FOUND");
          return;
        }

        analytics.event.task_address_form.response.success_application_found();
        setLicenseDetails(resultLicenseData);
      })
      .catch(() => {
        setError("SEARCH_FAILED");
      })
      .finally(async () => {
        refresh();
        setIsLoading(false);
      });
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
        <TaskHeader
          task={props.task}
          tooltipText={hasCompletedSearch ? Config.licenseSearchTask.tooltipText : undefined}
        />
        <Box sx={{ width: "100%" }}>
          <TabContext value={tabIndex.toString()}>
            <Box>
              <TabList
                onChange={onSelectTab}
                aria-label="License task"
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  marginTop: ".25rem",
                  marginLeft: ".5rem",
                }}
              >
                <Tab value="0" sx={tabStyle} label={Config.licenseSearchTask.tab1Text} />
                <Tab value="1" sx={tabStyle} label={Config.licenseSearchTask.tab2Text} />
              </TabList>
            </Box>
            <TabPanel value="0">
              <div className="margin-top-3">
                <UnlockedBy task={props.task} />
                <Content>{props.task.summaryDescriptionMd || ""}</Content>
                <Content>{getModifiedTaskContent(roadmap, props.task, "contentMd")}</Content>
              </div>
              <CtaContainer>
                <ActionBarLayout>
                  <div className="margin-top-2 mobile-lg:margin-top-0">
                    <SecondaryButton
                      isColor="primary"
                      onClick={(): void => {
                        analytics.event.task_button_i_already_submitted.click.view_status_tab(
                          "check_status",
                          "start_application",
                        );
                        setTabIndex(STATUS_TAB_INDEX);
                      }}
                      dataTestId="cta-secondary"
                    >
                      {Config.licenseSearchTask.secondaryCTAFirstLineText}
                    </SecondaryButton>
                  </div>
                  <PrimaryButton
                    isColor="primary"
                    onClick={(): void => {
                      analytics.event.task_primary_call_to_action.click.open_external_website(
                        Config.licenseSearchTask.primaryCTAFirstLineText,
                        callToActionLink,
                        "start_application",
                      );
                      openInNewTab(callToActionLink);
                    }}
                    isRightMarginRemoved
                    dataTestId="cta-primary"
                  >
                    {Config.licenseSearchTask.primaryCTAFirstLineText}
                    <Icon iconName="launch" className="usa-icon-button-margin" />
                  </PrimaryButton>
                </ActionBarLayout>
              </CtaContainer>
            </TabPanel>
            <TabPanel value="1">
              {hasCompletedSearch && licenseDetails ? (
                <LicenseDetailReceipt
                  licenseTaskId={props.task.id}
                  licenseDetails={licenseDetails}
                  onEdit={onEdit}
                />
              ) : (
                <CheckLicenseStatus
                  onSubmit={onSubmit}
                  error={error}
                  isLoading={isLoading}
                  licenseTaskId={props.task.id}
                />
              )}
            </TabPanel>
          </TabContext>
        </Box>
      </div>
    </NeedsAccountModalWrapper>
  );
};
