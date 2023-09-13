import { NeedsAccountModalWrapper } from "@/components/auth/NeedsAccountModalWrapper";
import { Content } from "@/components/Content";
import { TaskHeader } from "@/components/TaskHeader";
import { CheckStatus } from "@/components/tasks/CheckStatus";
import { LicenseStatusReceipt } from "@/components/tasks/LicenseStatusReceipt";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import * as api from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { LicenseSearchError, Task } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { getModifiedTaskContent } from "@/lib/utils/roadmap-helpers";
import { LicenseStatusResult, NameAndAddress, UserData } from "@businessnjgovnavigator/shared/";
import { TabContext, TabList, TabPanel } from "@mui/lab/";
import { Box, Tab } from "@mui/material";
import React, { ReactElement, useState } from "react";

interface Props {
  task: Task;
}

const APPLICATION_TAB_INDEX = 0;
const STATUS_TAB_INDEX = 1;

export const LicenseTask = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const callToActionLink = getModifiedTaskContent(roadmap, props.task, "callToActionLink");
  const [tabIndex, setTabIndex] = useState(APPLICATION_TAB_INDEX);
  const [error, setError] = useState<LicenseSearchError | undefined>(undefined);
  const [licenseStatusResult, setLicenseStatusResult] = useState<LicenseStatusResult | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { business, refresh } = useUserData();
  const { Config } = useConfig();

  const allFieldsHaveValues = (nameAndAddress: NameAndAddress): boolean => {
    return !!(nameAndAddress.name && nameAndAddress.addressLine1 && nameAndAddress.zipCode);
  };

  useMountEffectWhenDefined(() => {
    if (!business) return;
    if (business.licenseData) {
      setTabIndex(STATUS_TAB_INDEX);
    }
    if (business.licenseData?.completedSearch) {
      setLicenseStatusResult({
        status: business.licenseData.status,
        checklistItems: business.licenseData.items,
      });
    }
  }, business);

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
    setLicenseStatusResult(undefined);
  };

  const onSubmit = (nameAndAddress: NameAndAddress): void => {
    if (!business || !business.profileData.industryId) return;

    if (!allFieldsHaveValues(nameAndAddress)) {
      setError("FIELDS_REQUIRED");
      return;
    }

    setIsLoading(true);
    api
      .checkLicenseStatus(nameAndAddress)
      .then((result: UserData) => {
        analytics.event.task_address_form.response.success_application_found();
        const resultLicenseData = result.businesses[result.currentBusinessId].licenseData;
        if (!resultLicenseData) return;
        setLicenseStatusResult({
          status: resultLicenseData.status,
          checklistItems: resultLicenseData.items,
        });
        setError(undefined);
      })
      .catch((error_) => {
        if (error_ === 404) {
          analytics.event.task_address_form.response.fail_application_not_found();
          setError("NOT_FOUND");
        } else {
          setError("SEARCH_FAILED");
        }
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
    <NeedsAccountModalWrapper>
      <div className="flex flex-column">
        <TaskHeader
          task={props.task}
          tooltipText={
            business?.licenseData?.completedSearch ? Config.licenseSearchTask.tooltipText : undefined
          }
        />
        <Box sx={{ width: "100%" }}>
          <TabContext value={tabIndex.toString()}>
            <Box>
              <TabList
                onChange={onSelectTab}
                aria-label="License task"
                sx={{ borderBottom: 1, borderColor: "divider", marginTop: ".25rem", marginLeft: ".5rem" }}
              >
                <Tab value="0" sx={tabStyle} label={Config.licenseSearchTask.tab1Text} />
                <Tab value="1" sx={tabStyle} label={Config.licenseSearchTask.tab2Text} />
              </TabList>
            </Box>
            <TabPanel value="0" sx={{ paddingX: 0 }}>
              <div className="margin-top-3">
                <UnlockedBy task={props.task} />
                <Content>{props.task.summaryDescriptionMd || ""}</Content>
                <Content>{getModifiedTaskContent(roadmap, props.task, "contentMd")}</Content>
              </div>
              <div className="flex flex-column margin-top-4 margin-bottom-1">
                <a href={callToActionLink} target="_blank" rel="noreferrer noopener">
                  <button
                    onClick={(): void => {
                      analytics.event.task_primary_call_to_action.click.open_external_website(
                        Config.licenseSearchTask.primaryCTAFirstLineText,
                        callToActionLink,
                        "start_application"
                      );
                    }}
                    className="usa-button width-100 margin-bottom-2"
                    data-testid="cta-primary"
                  >
                    <div className="flex flex-column">
                      <div>{Config.licenseSearchTask.primaryCTAFirstLineText}</div>
                      <div className="font-body-3xs margin-top-05">
                        {Config.licenseSearchTask.primaryCTASecondLineText}
                      </div>
                    </div>
                  </button>
                </a>
                <button
                  onClick={(): void => {
                    analytics.event.task_button_i_already_submitted.click.view_status_tab(
                      "check_status",
                      "start_application"
                    );
                    setTabIndex(STATUS_TAB_INDEX);
                  }}
                  className="usa-button usa-button--outline width-100"
                  data-testid="cta-secondary"
                >
                  <div className="flex flex-column">
                    <div>{Config.licenseSearchTask.secondaryCTAFirstLineText}</div>
                    <div className="font-body-3xs margin-top-05">
                      {Config.licenseSearchTask.secondaryCTASecondLineText}
                    </div>
                  </div>
                </button>
              </div>
            </TabPanel>
            <TabPanel value="1" sx={{ paddingX: 0 }}>
              {licenseStatusResult ? (
                <LicenseStatusReceipt
                  status={licenseStatusResult.status}
                  items={licenseStatusResult.checklistItems}
                  onEdit={onEdit}
                />
              ) : (
                <CheckStatus onSubmit={onSubmit} error={error} isLoading={isLoading} />
              )}
            </TabPanel>
          </TabContext>
        </Box>
      </div>
    </NeedsAccountModalWrapper>
  );
};
