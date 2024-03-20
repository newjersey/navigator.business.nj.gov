import { useConfig } from "@/lib/data-hooks/useConfig";
import { useQueryControlledAlert } from "@/lib/data-hooks/useQueryControlledAlert";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import { ReactElement } from "react";

export const DashboardAlerts = (): ReactElement => {
  const { Config } = useConfig();

  const ProfileUpdatedAlert = useQueryControlledAlert({
    queryKey: QUERIES.success,
    pagePath: ROUTES.dashboard,
    headerText: Config.profileDefaults.default.successTextHeader,
    bodyText: Config.profileDefaults.default.successTextBody,
    variant: "success",
  });

  const CalendarAlert = useQueryControlledAlert({
    queryKey: QUERIES.fromFormBusinessEntity,
    pagePath: ROUTES.dashboard,
    headerText: Config.dashboardDefaults.calendarSnackbarHeading,
    bodyText: Config.dashboardDefaults.calendarSnackbarBody,
    variant: "success",
    dataTestId: "snackbar-alert-calendar",
  });

  const CertificationsAlert = useQueryControlledAlert({
    queryKey: QUERIES.fromForming,
    pagePath: ROUTES.dashboard,
    headerText: Config.dashboardDefaults.certificationsSnackbarHeading,
    bodyText: Config.dashboardDefaults.certificationsSnackbarBody,
    variant: "success",
    dataTestId: "certification-alert",
  });

  const DeadlinesAndOpportunitiesAlert = useQueryControlledAlert({
    queryKey: QUERIES.fromForming,
    pagePath: ROUTES.dashboard,
    headerText: Config.dashboardDefaults.opportunitiesAndDeadlinesHeading,
    bodyText: Config.dashboardDefaults.opportunitiesAndDeadlinesBody,
    variant: "success",
    dataTestId: "deadlines-opportunities-alert",
    delayInMilliseconds: Config.dashboardDefaults.opportunitiesAndDeadlinesTimeDelay,
  });

  const FundingAlert = useQueryControlledAlert({
    queryKey: QUERIES.fromFunding,
    pagePath: ROUTES.dashboard,
    headerText: Config.dashboardDefaults.fundingSnackbarHeading,
    bodyText: Config.dashboardDefaults.fundingSnackbarBody,
    variant: "success",
    dataTestId: "funding-alert",
  });

  const DeferredQuestionAnsweredAlert = useQueryControlledAlert({
    queryKey: QUERIES.deferredQuestionAnswered,
    pagePath: ROUTES.dashboard,
    headerText: Config.dashboardDefaults.deferredOnboardingSnackbarHeader,
    bodyText: Config.dashboardDefaults.deferredOnboardingSnackbarBody,
    variant: "success",
    dataTestId: "deferredQuestionAnswered-alert",
  });

  const AdditionalBusinessAlert = useQueryControlledAlert({
    queryKey: QUERIES.fromAdditionalBusiness,
    pagePath: ROUTES.dashboard,
    headerText: Config.dashboardDefaults.additionalBusinessSnackbarHeader,
    bodyText: Config.dashboardDefaults.additionalBusinessSnackbarBody,
    variant: "success",
    dataTestId: "fromAdditionalBusiness-alert",
  });

  return (
    <div data-testid="dashboard-alerts">
      <>{ProfileUpdatedAlert}</>
      <>{DeadlinesAndOpportunitiesAlert}</>
      <>{CalendarAlert}</>
      <>{CertificationsAlert}</>
      <>{FundingAlert}</>
      <>{DeferredQuestionAnsweredAlert}</>
      <>{AdditionalBusinessAlert}</>
    </div>
  );
};
