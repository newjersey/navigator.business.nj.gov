import { SignUpModalWrapper } from "@/components/auth/SignUpModal";
import { Content } from "@/components/Content";
import { TaskHeader } from "@/components/TaskHeader";
import { CheckStatus } from "@/components/tasks/CheckStatus";
import { LicenseStatusReceipt } from "@/components/tasks/LicenseStatusReceipt";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import * as api from "@/lib/api-client/apiClient";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useTaskFromRoadmap } from "@/lib/data-hooks/useTaskFromRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { getModifiedTaskContent, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { LicenseStatusResult, NameAndAddress, UserData } from "@businessnjgovnavigator/shared/";
import { TabContext, TabList, TabPanel } from "@mui/lab/";
import { Box, Tab } from "@mui/material";
import React, { ReactElement, useState } from "react";

interface Props {
  task: Task;
}

const APPLICATION_TAB_INDEX = 0;
const STATUS_TAB_INDEX = 1;

export type LicenseSearchError = "NOT_FOUND" | "FIELDS_REQUIRED" | "SEARCH_FAILED";

export const LicenseTask = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const callToActionLink = getModifiedTaskContent(roadmap, props.task, "callToActionLink");
  const [tabIndex, setTabIndex] = useState(APPLICATION_TAB_INDEX);
  const [error, setError] = useState<LicenseSearchError | undefined>(undefined);
  const [licenseStatusResult, setLicenseStatusResult] = useState<LicenseStatusResult | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { userData, refresh } = useUserData();
  const taskFromRoadmap = useTaskFromRoadmap(props.task.id);

  const allFieldsHaveValues = (nameAndAddress: NameAndAddress) => {
    return nameAndAddress.name && nameAndAddress.addressLine1 && nameAndAddress.zipCode;
  };

  useMountEffectWhenDefined(() => {
    if (!userData) return;
    if (userData.licenseData) {
      setTabIndex(STATUS_TAB_INDEX);
    }
    if (userData.licenseData?.completedSearch) {
      setLicenseStatusResult({
        status: userData.licenseData.status,
        checklistItems: userData.licenseData.items,
      });
    }
  }, userData);

  const onSelectTab = (event: React.SyntheticEvent, newValue: string): void => {
    const index = parseInt(newValue);
    if (index === APPLICATION_TAB_INDEX) {
      analytics.event.task_tab_start_application.click.view_application_tab();
    } else if (index === STATUS_TAB_INDEX) {
      analytics.event.task_tab_check_status.click.view_status_tab();
    }

    setTabIndex(index);
  };

  const onEdit = () => {
    setLicenseStatusResult(undefined);
  };

  const onSubmit = (nameAndAddress: NameAndAddress): void => {
    if (!userData || !userData.profileData.industryId) return;

    if (!allFieldsHaveValues(nameAndAddress)) {
      setError("FIELDS_REQUIRED");
      return;
    }

    setIsLoading(true);
    api
      .checkLicenseStatus(nameAndAddress)
      .then((result: UserData) => {
        analytics.event.task_address_form.response.success_application_found();
        if (!result.licenseData) return;
        setLicenseStatusResult({
          status: result.licenseData.status,
          checklistItems: result.licenseData.items,
        });
        setError(undefined);
      })
      .catch((errorCode) => {
        if (errorCode === 404) {
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

  return (
    <SignUpModalWrapper>
      <div className="flex flex-column">
        <TaskHeader task={props.task} tooltipText={Config.licenseSearchTask.tooltipText} />
        <Box sx={{ width: "100%" }}>
          <TabContext value={tabIndex.toString()}>
            <Box>
              <TabList
                onChange={onSelectTab}
                aria-label="License task"
                sx={{ borderBottom: 0, borderColor: "divider", marginTop: ".25rem" }}
              >
                <Box role="tab" sx={{ border: 0, borderColor: "divider", width: ".5rem" }} />
                <Tab
                  value="0"
                  sx={{ border: 1, borderColor: "divider" }}
                  label={Config.licenseSearchTask.tab1Text}
                />
                <Tab
                  value="1"
                  sx={{ border: 1, borderColor: "divider" }}
                  label={Config.licenseSearchTask.tab2Text}
                />
                <Box sx={{ borderBottom: 1, borderColor: "divider", width: "100%" }} />
              </TabList>
            </Box>
            <TabPanel value="0" sx={{ paddingX: 0 }}>
              <div className="margin-top-3">
                <UnlockedBy taskLinks={taskFromRoadmap?.unlockedBy || []} isLoading={!taskFromRoadmap} />
                <Content>{getModifiedTaskContent(roadmap, props.task, "contentMd")}</Content>
              </div>
              <div className="flex flex-column margin-top-4 margin-bottom-1">
                <a href={callToActionLink} target="_blank" rel="noreferrer noopener">
                  <button
                    onClick={() => {
                      analytics.event.task_primary_call_to_action.click.open_external_website();
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
                  onClick={() => {
                    analytics.event.task_button_i_already_submitted.click.view_status_tab();
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
    </SignUpModalWrapper>
  );
};
