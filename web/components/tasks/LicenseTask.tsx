import { TaskHeader } from "@/components/TaskHeader";
import { Content } from "@/components/Content";
import { getModifiedTaskContent, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import React, { ReactElement, useState } from "react";
import { LicenseStatusResult, NameAndAddress, Task, UserData } from "@/lib/types/types";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { LicenseScreenDefaults } from "@/display-content/tasks/license/LicenseScreenDefaults";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import { CheckStatus } from "@/components/tasks/CheckStatus";
import * as api from "@/lib/api-client/apiClient";
import { LicenseStatusReceipt } from "@/components/tasks/LicenseStatusReceipt";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
//import { Unlocks } from "@/components/tasks/Unlocks";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { useTaskFromRoadmap } from "@/lib/data-hooks/useTaskFromRoadmap";

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
  const { userData, update } = useUserData();
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

  const onSelectTab = (index: number): void => {
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
    if (!userData || !userData.onboardingData.industryId) return;

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
        update(await api.getUserData(userData.user.id));
        setIsLoading(false);
      });
  };

  return (
    <div className="flex flex-column">
      <TaskHeader task={props.task} tooltipText={LicenseScreenDefaults.tooltipText} />

      <Tabs selectedIndex={tabIndex} onSelect={onSelectTab}>
        <TabList>
          <Tab>{LicenseScreenDefaults.tab1Text}</Tab>
          <Tab>{LicenseScreenDefaults.tab2Text}</Tab>
        </TabList>

        <TabPanel>
          <div className="margin-top-3">
            <UnlockedBy taskLinks={taskFromRoadmap?.unlockedBy || []} isLoading={!taskFromRoadmap} />
            <Content>{getModifiedTaskContent(roadmap, props.task, "contentMd")}</Content>
            {/* restore when #470 is decided
            <Unlocks taskLinks={taskFromRoadmap?.unlocks || []} isLoading={!taskFromRoadmap} />
            */}
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
                  <div>{LicenseScreenDefaults.primaryCTAFirstLineText}</div>
                  <div className="font-body-3xs margin-top-05">
                    {LicenseScreenDefaults.primaryCTASecondLineText}
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
                <div>{LicenseScreenDefaults.secondaryCTAFirstLineText}</div>
                <div className="font-body-3xs margin-top-05">
                  {LicenseScreenDefaults.secondaryCTASecondLineText}
                </div>
              </div>
            </button>
          </div>
        </TabPanel>
        <TabPanel>
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
      </Tabs>
    </div>
  );
};
