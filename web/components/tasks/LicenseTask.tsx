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

interface Props {
  task: Task;
}

const APPLICATION_TAB_INDEX = 0;
const STATUS_TAB_INDEX = 1;

export type ErrorAlertType = "NONE" | "NOT_FOUND" | "FIELDS_REQUIRED";

export const LicenseTask = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const callToActionLink = getModifiedTaskContent(roadmap, props.task, "callToActionLink");
  const [tabIndex, setTabIndex] = useState(APPLICATION_TAB_INDEX);
  const [showErrorAlert, setShowErrorAlert] = useState<ErrorAlertType>("NONE");
  const [licenseStatusResult, setLicenseStatusResult] = useState<LicenseStatusResult | undefined>(undefined);
  const { userData, update } = useUserData();

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

  const onEdit = () => {
    setLicenseStatusResult(undefined);
  };

  const onSubmit = async (nameAndAddress: NameAndAddress) => {
    if (!userData || !userData.onboardingData.industry) return;

    if (!allFieldsHaveValues(nameAndAddress)) {
      setShowErrorAlert("FIELDS_REQUIRED");
      return;
    }

    api
      .checkLicenseStatus(nameAndAddress)
      .then((result: UserData) => {
        if (!result.licenseData) return;
        setLicenseStatusResult({
          status: result.licenseData.status,
          checklistItems: result.licenseData.items,
        });
        setShowErrorAlert("NONE");
      })
      .catch(() => {
        setShowErrorAlert("NOT_FOUND");
      })
      .finally(async () => {
        update(await api.getUserData(userData.user.id));
      });
  };

  return (
    <div className="margin-top-3 fdc fg1">
      <div className="margin-x-3">
        <TaskHeader task={props.task} tooltipText={LicenseScreenDefaults.tooltipText} />
      </div>

      <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
        <div className="margin-x-3">
          <TabList>
            <Tab>{LicenseScreenDefaults.tab1Text}</Tab>
            <Tab>{LicenseScreenDefaults.tab2Text}</Tab>
          </TabList>
        </div>
        <TabPanel>
          <div className="margin-3 height-full">
            <Content>{getModifiedTaskContent(roadmap, props.task, "contentMd")}</Content>
            <div className="fdc margin-top-4">
              <a
                href={callToActionLink}
                target="_blank"
                rel="noreferrer noopener"
                className="margin-bottom-2"
              >
                <button className="usa-button width-100" data-testid="cta-primary">
                  <div className="fdc">
                    <div>{LicenseScreenDefaults.primaryCTAFirstLineText}</div>
                    <div className="font-body-3xs margin-top-05">
                      {LicenseScreenDefaults.primaryCTASecondLineText}
                    </div>
                  </div>
                </button>
              </a>
              <button
                onClick={() => setTabIndex(STATUS_TAB_INDEX)}
                className="usa-button usa-button--outline width-100"
                data-testid="cta-secondary"
              >
                <div className="fdc">
                  <div>{LicenseScreenDefaults.secondaryCTAFirstLineText}</div>
                  <div className="font-body-3xs margin-top-05">
                    {LicenseScreenDefaults.secondaryCTASecondLineText}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </TabPanel>
        <TabPanel>
          <div className="margin-top-3 fdc fg1">
            {licenseStatusResult ? (
              <LicenseStatusReceipt
                status={licenseStatusResult.status}
                items={licenseStatusResult.checklistItems}
                onEdit={onEdit}
              />
            ) : (
              <div className="margin-3">
                <CheckStatus onSubmit={onSubmit} showErrorAlert={showErrorAlert} />
              </div>
            )}
          </div>
        </TabPanel>
      </Tabs>
    </div>
  );
};
