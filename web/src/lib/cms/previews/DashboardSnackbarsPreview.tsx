import { Content } from "@/components/Content";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ReactElement } from "react";

const DashboardSnackbarsPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <h2>Calendar Snackbar</h2>
        <SnackbarAlert
          variant="success"
          isOpen={true}
          close={(): void => {}}
          heading={config.dashboardDefaults.calendarSnackbarHeading}
        >
          <Content>{config.dashboardDefaults.calendarSnackbarBody}</Content>
        </SnackbarAlert>

        <h2>Certifications Snackbar</h2>
        <SnackbarAlert
          variant="success"
          isOpen={true}
          close={(): void => {}}
          heading={config.dashboardDefaults.certificationsSnackbarHeading}
        >
          <Content>{config.dashboardDefaults.certificationsSnackbarBody}</Content>
        </SnackbarAlert>

        <h2>Deferred Onboarding Snackbar</h2>
        <SnackbarAlert
          variant="success"
          isOpen={true}
          close={(): void => {}}
          heading={config.dashboardDefaults.deferredOnboardingSnackbarHeader}
        >
          <Content>{config.dashboardDefaults.deferredOnboardingSnackbarBody}</Content>
        </SnackbarAlert>

        <h2>Funding Snackbar</h2>
        <SnackbarAlert
          variant="success"
          isOpen={true}
          close={(): void => {}}
          heading={config.dashboardDefaults.fundingSnackbarHeading}
        >
          <Content>{config.dashboardDefaults.fundingSnackbarBody}</Content>
        </SnackbarAlert>

        <h2>Hidden Tasks Snackbar</h2>
        <SnackbarAlert
          variant="success"
          isOpen={true}
          close={(): void => {}}
          heading={config.dashboardDefaults.hiddenTasksSnackbarHeading}
        >
          <Content>{config.dashboardDefaults.hiddenTasksSnackbarBody}</Content>
        </SnackbarAlert>
      </div>
    </ConfigContext.Provider>
  );
};

export default DashboardSnackbarsPreview;
