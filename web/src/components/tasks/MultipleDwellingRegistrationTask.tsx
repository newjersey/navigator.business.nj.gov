import { NeedsAccountModalWrapper } from "@/components/auth/NeedsAccountModalWrapper";
import { Content } from "@/components/Content";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { Icon } from "@/components/njwds/Icon";
import { getTabId, getTabPanelId, TabPanel } from "@/components/TabPanel";
import { TaskHeader } from "@/components/TaskHeader";
import { CheckHousingRegistrationStatus } from "@/components/tasks/CheckHousingRegistrationStatus";
import { HousingRegistrationStatusSummary } from "@/components/tasks/HousingRegistrationStatusSummary";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { HousingMunicipalitiesContext } from "@/contexts/housingMunicipalitiesContext";
import * as api from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { openInNewTab } from "@/lib/utils/helpers";
import { getModifiedTaskContent } from "@/lib/utils/roadmap-helpers";
import {
  HousingAddress,
  HousingRegistrationRequestLookupResponse,
} from "@businessnjgovnavigator/shared";
import { MultipleDwellingSearchError, Task } from "@businessnjgovnavigator/shared/types";
import { Box, Tab, Tabs } from "@mui/material";
import React, { ReactElement, useContext, useState } from "react";
import { CtaContainer } from "../njwds-extended/cta/CtaContainer";

interface Props {
  task: Task;
  CMS_ONLY_disable_overlay?: boolean;
}

const APPLICATION_TAB_INDEX = 0;
const STATUS_TAB_INDEX = 1;

export const MultipleDwellingRegistrationTask = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const callToActionLink = getModifiedTaskContent(roadmap, props.task, "callToActionLink");
  const [tabIndex, setTabIndex] = useState(APPLICATION_TAB_INDEX);
  const [error, setError] = useState<MultipleDwellingSearchError | undefined>(undefined);
  const [housingAddress, setHousingAddress] = useState<HousingAddress | undefined>(undefined);
  const [housingRegistrationLookupSummary, setHousingRegistrationLookupSummary] = useState<
    HousingRegistrationRequestLookupResponse | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { municipalities } = useContext(HousingMunicipalitiesContext);
  const { Config } = useConfig();

  const onSelectTab = (event: React.SyntheticEvent, newValue: number): void => {
    setTabIndex(newValue);
  };

  const onEdit = (): void => {
    setHousingAddress(undefined);
    setHousingRegistrationLookupSummary(undefined);
  };

  if (municipalities.length === 0) {
    setError(`SEARCH_FAILED`);
  }

  const onSubmit = (address: HousingAddress): void => {
    if (!(address?.address1 && address?.municipalityExternalId)) {
      setError("FIELDS_REQUIRED");
      return;
    }
    setIsLoading(true);
    api
      .checkHousingRegistrationStatus(
        address.address1,
        address.municipalityExternalId,
        "multipleDwelling",
      )
      .then((result) => {
        if (result.lookupStatus === "NO PROPERTY INTERESTS FOUND") {
          setError("NO_PROPERTY_INTEREST_FOUND");
        } else if (result.lookupStatus === "NO REGISTRATIONS FOUND") {
          setError("NO_MULTIPLE_DWELLINGS_REGISTRATIONS_FOUND");
        } else {
          setError(undefined);
          setHousingAddress(address);
          setHousingRegistrationLookupSummary(result);
        }
      })
      .catch(() => {
        setError("SEARCH_FAILED");
      })
      .finally(async () => {
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
        <TaskHeader task={props.task} />
        <Box sx={{ width: "100%" }}>
          <Box>
            <Tabs
              onChange={onSelectTab}
              aria-label="Multiple Dwelling Registration task"
              value={tabIndex}
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                marginTop: ".25rem",
                marginLeft: ".5rem",
              }}
            >
              <Tab
                aria-controls={getTabPanelId(
                  "multiple-dwelling-registration-task",
                  APPLICATION_TAB_INDEX,
                )}
                data-testid={"start-application-tab"}
                id={getTabId("multiple-dwelling-registration-task", APPLICATION_TAB_INDEX)}
                value={APPLICATION_TAB_INDEX}
                sx={tabStyle}
                label={Config.housingRegistrationSearchTask.registrationTab1Text}
              />
              <Tab
                aria-controls={getTabPanelId(
                  "multiple-dwelling-registration-task",
                  STATUS_TAB_INDEX,
                )}
                data-testid={"check-status-tab"}
                id={getTabId("multiple-dwelling-registration-task", STATUS_TAB_INDEX)}
                value={STATUS_TAB_INDEX}
                sx={tabStyle}
                label={Config.housingRegistrationSearchTask.registrationTab2Text}
              />
            </Tabs>
          </Box>
          <TabPanel
            activeValue={tabIndex}
            idPrefix="multiple-dwelling-registration-task"
            value={APPLICATION_TAB_INDEX}
          >
            <div className="margin-top-3">
              <UnlockedBy task={props.task} />
              <Content>{props.task.summaryDescriptionMd || ""}</Content>
              <Content>{getModifiedTaskContent(roadmap, props.task, "contentMd")}</Content>
            </div>
            <CtaContainer>
              <ActionBarLayout>
                <div className="margin-top-2 mobile-lg:margin-top-0">
                  <SecondaryButton
                    isColor={"primary"}
                    onClick={() => {
                      setTabIndex(STATUS_TAB_INDEX);
                    }}
                  >
                    <div>
                      {Config.housingRegistrationSearchTask.registrationCallToActionSecondaryText}
                    </div>
                  </SecondaryButton>
                </div>
                <PrimaryButton
                  isRightMarginRemoved
                  isColor={"primary"}
                  onClick={() => {
                    openInNewTab(callToActionLink);
                  }}
                >
                  <div>
                    {Config.housingRegistrationSearchTask.registrationCallToActionPrimaryText}
                  </div>
                  <Icon iconName="launch" className="usa-icon-button-margin" />
                </PrimaryButton>
              </ActionBarLayout>
            </CtaContainer>
          </TabPanel>
          <TabPanel
            activeValue={tabIndex}
            idPrefix="multiple-dwelling-registration-task"
            value={STATUS_TAB_INDEX}
          >
            <div className="margin-top-3">
              {housingRegistrationLookupSummary ? (
                <HousingRegistrationStatusSummary
                  onEdit={onEdit}
                  summary={housingRegistrationLookupSummary}
                  task={props.task}
                  address={housingAddress}
                  dueDate={housingRegistrationLookupSummary.renewalDate}
                />
              ) : (
                <CheckHousingRegistrationStatus
                  onSubmit={onSubmit}
                  error={error}
                  isLoading={isLoading}
                  municipalities={municipalities}
                />
              )}
            </div>
          </TabPanel>
        </Box>
      </div>
    </NeedsAccountModalWrapper>
  );
};
