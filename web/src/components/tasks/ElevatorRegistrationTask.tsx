import { Content } from "@/components/Content";
import { TaskHeader } from "@/components/TaskHeader";
import { NeedsAccountModalWrapper } from "@/components/auth/NeedsAccountModalWrapper";
import { CheckElevatorRegistrationStatus } from "@/components/tasks/CheckElevatorRegistrationStatus";
import { ElevatorRegistrationStatusSummary } from "@/components/tasks/ElevatorRegistrationStatusSummary";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import * as api from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { ElevatorRegistrationSearchError, Task } from "@/lib/types/types";
import { getModifiedTaskContent } from "@/lib/utils/roadmap-helpers";
import {
  ElevatorSafetyAddress,
  ElevatorSafetyRegistrationSummary,
} from "@businessnjgovnavigator/shared/elevatorSafety";
import { TabContext, TabList, TabPanel } from "@mui/lab/";
import { Box, Tab } from "@mui/material";
import React, { ReactElement, useState } from "react";

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
  const { Config } = useConfig();

  const onSelectTab = (event: React.SyntheticEvent, newValue: string): void => {
    const index = Number.parseInt(newValue);
    setTabIndex(index);
  };

  const onEdit = (): void => {
    setElevatorRegistrationSummary(undefined);
    setElevatorSafetyAddress(undefined);
  };

  const onSubmit = (address: ElevatorSafetyAddress): void => {
    if (address?.address1) {
      setIsLoading(true);
      api
        .checkElevatorRegistrationStatus(address?.address1, address?.zipCode)
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
                />
                <Tab
                  value="1"
                  sx={tabStyle}
                  label={Config.elevatorRegistrationSearchTask.registrationTab2Text}
                />
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
                    onClick={(): void => {}}
                    className="usa-button width-100 margin-bottom-2"
                    data-testid="cta-primary"
                  >
                    <div className="flex flex-column">
                      <div>{Config.elevatorRegistrationSearchTask.registrationCallToActionPrimaryText}</div>
                    </div>
                  </button>
                </a>
                <button
                  onClick={(): void => {
                    setTabIndex(STATUS_TAB_INDEX);
                  }}
                  className="usa-button usa-button--outline width-100"
                  data-testid="cta-secondary"
                >
                  <div className="flex flex-column">
                    <div>{Config.elevatorRegistrationSearchTask.registrationCallToActionSecondaryText}</div>
                  </div>
                </button>
              </div>
            </TabPanel>
            <TabPanel value="1" sx={{ paddingX: 0 }}>
              {elevatorRegistrationSummary ? (
                <ElevatorRegistrationStatusSummary
                  onEdit={onEdit}
                  summary={elevatorRegistrationSummary}
                  task={props.task}
                  address={elevatorSafetyAddress}
                />
              ) : (
                <CheckElevatorRegistrationStatus onSubmit={onSubmit} error={error} isLoading={isLoading} />
              )}
            </TabPanel>
          </TabContext>
        </Box>
      </div>
    </NeedsAccountModalWrapper>
  );
};
