import { NeedsAccountModalWrapper } from "@/components/auth/NeedsAccountModalWrapper";
import { Content } from "@/components/Content";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { Icon } from "@/components/njwds/Icon";
import { TaskHeader } from "@/components/TaskHeader";
import { CheckHousingRegistrationStatus } from "@/components/tasks/CheckHousingRegistrationStatus";
import { HousingRegistrationStatusSummary } from "@/components/tasks/HousingRegistrationStatusSummary";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { HousingMunicipalitiesContext } from "@/contexts/housingMunicipalitiesContext";
import * as api from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { MultipleDwellingSearchError, Task } from "@/lib/types/types";
import { openInNewTab } from "@/lib/utils/helpers";
import { getModifiedTaskContent } from "@/lib/utils/roadmap-helpers";
import {
  HousingAddress,
  HousingRegistrationRequestLookupResponse,
} from "@businessnjgovnavigator/shared/housing";
import { TabContext, TabList, TabPanel } from "@mui/lab/";
import { Box, Tab } from "@mui/material";
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

  const onSelectTab = (event: React.SyntheticEvent, newValue: string): void => {
    const index = Number.parseInt(newValue);
    setTabIndex(index);
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
      .checkHousingRegistrationStatus(address.address1, address.municipalityExternalId, "multipleDwelling")
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
          <TabContext value={tabIndex.toString()}>
            <Box>
              <TabList
                onChange={onSelectTab}
                aria-label="Multiple Dwelling Registration task"
                sx={{ borderBottom: 1, borderColor: "divider", marginTop: ".25rem", marginLeft: ".5rem" }}
              >
                <Tab
                  value="0"
                  sx={tabStyle}
                  label={Config.housingRegistrationSearchTask.registrationTab1Text}
                  data-testid={"start-application-tab"}
                />
                <Tab
                  value="1"
                  sx={tabStyle}
                  label={Config.housingRegistrationSearchTask.registrationTab2Text}
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
                      isColor={"primary"}
                      onClick={() => {
                        setTabIndex(STATUS_TAB_INDEX);
                      }}
                    >
                      <div>{Config.housingRegistrationSearchTask.registrationCallToActionSecondaryText}</div>
                    </SecondaryButton>
                  </div>
                  <PrimaryButton
                    isRightMarginRemoved
                    isColor={"primary"}
                    onClick={() => {
                      openInNewTab(callToActionLink);
                    }}
                  >
                    <div>{Config.housingRegistrationSearchTask.registrationCallToActionPrimaryText}</div>
                    <Icon iconName="launch" className="usa-icon-button-margin" />
                  </PrimaryButton>
                </ActionBarLayout>
              </CtaContainer>
            </TabPanel>
            <TabPanel value="1">
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
          </TabContext>
        </Box>
      </div>
    </NeedsAccountModalWrapper>
  );
};
