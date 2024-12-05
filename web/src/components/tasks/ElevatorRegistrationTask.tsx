import { Content } from "@/components/Content";
import { TaskHeader } from "@/components/TaskHeader";
import { NeedsAccountModalWrapper } from "@/components/auth/NeedsAccountModalWrapper";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { Icon } from "@/components/njwds/Icon";
import { CheckElevatorRegistrationStatus } from "@/components/tasks/CheckElevatorRegistrationStatus";
import { ElevatorRegistrationStatusSummary } from "@/components/tasks/ElevatorRegistrationStatusSummary";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { HousingMunicipalitiesContext } from "@/contexts/housingMunicipalitiesContext";
import * as api from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { ElevatorRegistrationSearchError, Task } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { openInNewTab } from "@/lib/utils/helpers";
import { getModifiedTaskContent } from "@/lib/utils/roadmap-helpers";
import {
  ElevatorSafetyAddress,
  ElevatorSafetyRegistrationSummary,
} from "@businessnjgovnavigator/shared/elevatorSafety";
import { TabContext, TabList, TabPanel } from "@mui/lab/";
import { Box, Tab } from "@mui/material";
import React, { ReactElement, useContext, useState } from "react";

interface Props {
  task: Task;
  CMS_ONLY_disable_overlay?: boolean;
}

const APPLICATION_TAB_INDEX = 0;
const STATUS_TAB_INDEX = 1;

export const ElevatorRegistrationTask = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const callToActionLink = getModifiedTaskContent(roadmap, props.task, "callToActionLink");
  const [tabIndex, setTabIndex] = useState(APPLICATION_TAB_INDEX);
  const [error, setError] = useState<ElevatorRegistrationSearchError | undefined>(undefined);
  const [elevatorRegistrationSummary, setElevatorRegistrationSummary] = useState<
    ElevatorSafetyRegistrationSummary | undefined
  >(undefined);
  const [elevatorSafetyAddress, setElevatorSafetyAddress] = useState<ElevatorSafetyAddress | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { municipalities } = useContext(HousingMunicipalitiesContext);
  const { Config } = useConfig();

  const onSelectTab = (event: React.SyntheticEvent, newValue: string): void => {
    analytics.event.task_elevator_registration.click.check_my_elevator_application_status_tab_click();
    const index = Number.parseInt(newValue);
    setTabIndex(index);
  };

  const onEdit = (): void => {
    setElevatorRegistrationSummary(undefined);
    setElevatorSafetyAddress(undefined);
  };

  if (municipalities.length === 0) {
    setError("SEARCH_FAILED");
  }

  const onSubmit = (address: ElevatorSafetyAddress): void => {
    if (address?.address1 && address?.municipalityExternalId) {
      setIsLoading(true);
      api
        .checkElevatorRegistrationStatus(address.address1, address.municipalityExternalId)
        .then((result: ElevatorSafetyRegistrationSummary) => {
          if (result.lookupStatus === "NO PROPERTY INTERESTS FOUND") {
            setError("NO_PROPERTY_INTEREST_FOUND");
          } else if (result.lookupStatus === "NO REGISTRATIONS FOUND") {
            setError("NO_ELEVATOR_REGISTRATIONS_FOUND");
          } else {
            setElevatorRegistrationSummary(result);
            setElevatorSafetyAddress(address);
            setError(undefined);
          }
        })
        .catch(() => {
          setError("SEARCH_FAILED");
        })
        .finally(async () => {
          setIsLoading(false);
        });
    } else {
      analytics.event.task_elevator_registration.submit.elevator_registration_form_submission_failed();
      setError("FIELDS_REQUIRED");
      return;
    }
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
                aria-label="Elevator Registration task"
                sx={{ borderBottom: 1, borderColor: "divider", marginTop: ".25rem", marginLeft: ".5rem" }}
              >
                <Tab
                  value="0"
                  sx={tabStyle}
                  label={Config.elevatorRegistrationSearchTask.registrationTab1Text}
                  data-testid={"start-application-tab"}
                />
                <Tab
                  value="1"
                  sx={tabStyle}
                  label={Config.elevatorRegistrationSearchTask.registrationTab2Text}
                  data-testid={"check-status-tab"}
                />
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
                        analytics.event.task_elevator_registration.click.elevator_registration_button_click_update();
                        setTabIndex(STATUS_TAB_INDEX);
                      }}
                      dataTestId="cta-secondary"
                    >
                      {Config.elevatorRegistrationSearchTask.registrationCallToActionSecondaryText}
                    </SecondaryButton>
                  </div>
                  <PrimaryButton
                    isColor="primary"
                    onClick={(): void => {
                      analytics.event.task_elevator_registration.click.elevator_registration_button_click_register();
                      openInNewTab(callToActionLink);
                    }}
                    isRightMarginRemoved
                    dataTestId="cta-primary"
                  >
                    {Config.elevatorRegistrationSearchTask.registrationCallToActionPrimaryText}
                    <Icon iconName="launch" className="usa-icon-button-margin" />
                  </PrimaryButton>
                </ActionBarLayout>
              </CtaContainer>
            </TabPanel>
            <TabPanel value="1">
              <div className="margin-top-3">
                {elevatorRegistrationSummary ? (
                  <ElevatorRegistrationStatusSummary
                    onEdit={onEdit}
                    summary={elevatorRegistrationSummary}
                    task={props.task}
                    address={elevatorSafetyAddress}
                  />
                ) : (
                  <CheckElevatorRegistrationStatus
                    onSubmit={onSubmit}
                    error={error}
                    isLoading={isLoading}
                    municipalities={municipalities}
                  />
                )}
              </div>
            </TabPanel>
          </TabContext>
        </Box>
      </div>
    </NeedsAccountModalWrapper>
  );
};
