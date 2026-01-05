import { TaskHeader } from "@/components/TaskHeader";
import { NeedsAccountModalWrapper } from "@/components/auth/NeedsAccountModalWrapper";
import { XrayTabOne } from "@/components/xray/XrayTabOne";
import { XrayTabZero } from "@/components/xray/XrayTabZero";

import * as api from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { openInNewTab } from "@/lib/utils/helpers";
import { getModifiedTaskContent } from "@/lib/utils/roadmap-helpers";
import { Task, XrayRenewalCalendarEventType } from "@businessnjgovnavigator/shared/types";
import type { UserData } from "@businessnjgovnavigator/shared/userData";
import type {
  FacilityDetails,
  XrayData,
  XrayRegistrationStatus,
  XraySearchError,
} from "@businessnjgovnavigator/shared/xray";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab } from "@mui/material";
import React, { ReactElement, ReactNode, useEffect, useState } from "react";

interface Props {
  task?: Task;
  renewal?: XrayRenewalCalendarEventType;
  CMS_ONLY_disable_overlay?: boolean;
}

const APPLICATION_TAB_INDEX = 0;
const STATUS_TAB_INDEX = 1;
export const Xray = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { roadmap } = useRoadmap();
  const { business, refresh } = useUserData();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tabIndex, setTabIndex] = useState(APPLICATION_TAB_INDEX);
  const [error, setError] = useState<XraySearchError | undefined>();
  const [xrayRegistrationData, setXrayRegistrationData] = useState<XrayData | undefined>(undefined);

  useEffect(() => {
    if (!business) return;

    const hasValidData = business?.xrayRegistrationData?.status;

    if (hasValidData) {
      const timeoutId = setTimeout(() => {
        setTabIndex(STATUS_TAB_INDEX);
        setXrayRegistrationData(business.xrayRegistrationData);
      }, 0);
      return (): void => clearTimeout(timeoutId);
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

  const xrayStatusAnalytics = (status: XrayRegistrationStatus | undefined): void => {
    if (status === "EXPIRED") {
      analytics.event.xray_registration_check_status_results.appears.expired_registration_found();
    }
    if (status === "ACTIVE") {
      analytics.event.xray_registration_check_status_results.appears.active_registration_found();
    }
  };

  const onSubmit = (facilityDetails: FacilityDetails): void => {
    setError(undefined);
    if (!allFieldsHaveValues(facilityDetails)) {
      setError("FIELDS_REQUIRED");
      return;
    }

    setIsLoading(true);
    analytics.event.xray_registration_check_status_form.submit.status_lookup_initiated();
    api
      .checkXrayRegistrationStatus(facilityDetails)
      .then((userData: UserData) => {
        const xrayRegistrationData =
          userData.businesses[userData.currentBusinessId].xrayRegistrationData;
        if (!xrayRegistrationData?.status && xrayRegistrationData?.machines?.length === 0) {
          setError("NOT_FOUND");
          setIsLoading(false);
          analytics.event.xray_registration_check_status_error.appears.record_not_found_error();
          return;
        }
        xrayStatusAnalytics(xrayRegistrationData?.status);
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

  const getHeader = (): ReactNode => {
    if (props.task) {
      return <TaskHeader task={props.task} />;
    }
    if (props.renewal) {
      return (
        <div className="margin-bottom-2">
          <h1>{props.renewal.name}</h1>
        </div>
      );
    }
  };

  const xrayContentFromMarkdownAndConfig = (): {
    summaryMd: string;
    contentMd: string;
    callToActionPrimaryText: string;
    callToActionLink: string;
    callToActionSecondaryText: string;
    tab1Text: string;
    tab2Text: string;
    ariaLabel: string;
  } => {
    let summaryMd: string = "";
    let contentMd: string = "";
    let callToActionLink: string = "";

    if (props.task) {
      summaryMd = props.task.summaryDescriptionMd || "";
      contentMd = getModifiedTaskContent(roadmap, props.task, "contentMd");
      callToActionLink = getModifiedTaskContent(roadmap, props.task, "callToActionLink");
    }

    if (props.renewal) {
      summaryMd = props.renewal.summaryDescriptionMd || "";
      contentMd = props.renewal.contentMd;
      callToActionLink = props.renewal.callToActionLink || "";
    }

    const entriesFromConfig = props.task ? Config.xrayRegistrationTask : Config.xrayRenewal;

    return { summaryMd, contentMd, callToActionLink, ...entriesFromConfig };
  };

  const xrayContent = xrayContentFromMarkdownAndConfig();

  return (
    <NeedsAccountModalWrapper CMS_ONLY_disable_overlay={props.CMS_ONLY_disable_overlay}>
      <div className="flex flex-column">
        {getHeader()}
        <Box sx={{ width: "100%" }}>
          <TabContext value={tabIndex.toString()}>
            <Box>
              <TabList
                onChange={onSelectTab}
                aria-label={xrayContent.ariaLabel}
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
                  label={xrayContent.tab1Text}
                  data-testid={"start-application-tab"}
                />
                <Tab
                  value="1"
                  sx={tabStyle}
                  label={xrayContent.tab2Text}
                  data-testid={"check-status-tab"}
                />
              </TabList>
            </Box>
            <TabPanel value="0">
              <XrayTabZero
                xrayContent={xrayContent}
                ctaPrimaryText={xrayContent.callToActionPrimaryText}
                ctaPrimaryOnClick={(callToActionLink: string): void => {
                  analytics.event.xray_registration_expired_cta.click.xray_renewal_started_cta();
                  openInNewTab(callToActionLink);
                }}
                ctaSecondaryText={xrayContent.callToActionSecondaryText}
                ctaSecondaryOnClick={(): void => {
                  setTabIndex(STATUS_TAB_INDEX);
                }}
                issuingAgency={Config.xrayRegistrationTask.issuingAgency}
              />
            </TabPanel>
            <TabPanel value="1">
              <XrayTabOne
                xrayRegistrationData={xrayRegistrationData}
                error={error}
                isLoading={isLoading}
                onEdit={onEdit}
                onSubmit={onSubmit}
                goToRegistrationTab={goToRegistrationTab}
              />
            </TabPanel>
          </TabContext>
        </Box>
      </div>
    </NeedsAccountModalWrapper>
  );
};
