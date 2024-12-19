import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ReactElement } from "react";

const DashboardSnackbarsPreview = (props: PreviewProps): ReactElement<any> => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <Heading level={2}>Calendar Snackbar</Heading>
        <SnackbarAlert
          variant="success"
          isOpen={true}
          close={(): void => {}}
          heading={config.dashboardDefaults.calendarSnackbarHeading}
        >
          <Content>{config.dashboardDefaults.calendarSnackbarBody}</Content>
        </SnackbarAlert>

        <Heading level={2}>Certifications Snackbar</Heading>
        <SnackbarAlert
          variant="success"
          isOpen={true}
          close={(): void => {}}
          heading={config.dashboardDefaults.certificationsSnackbarHeading}
        >
          <Content>{config.dashboardDefaults.certificationsSnackbarBody}</Content>
        </SnackbarAlert>

        <Heading level={2}>Deferred Onboarding Snackbar</Heading>
        <SnackbarAlert
          variant="success"
          isOpen={true}
          close={(): void => {}}
          heading={config.dashboardDefaults.deferredOnboardingSnackbarHeader}
        >
          <Content>{config.dashboardDefaults.deferredOnboardingSnackbarBody}</Content>
        </SnackbarAlert>

        <Heading level={2}>Tax Registration Snackbar</Heading>
        <SnackbarAlert
          variant="success"
          isOpen={true}
          close={(): void => {}}
          heading={config.dashboardDefaults.taxRegistrationSnackbarHeading}
        >
          <Content>{config.dashboardDefaults.taxRegistrationSnackbarBody}</Content>
        </SnackbarAlert>

        <Heading level={2}>Funding Snackbar</Heading>
        <SnackbarAlert
          variant="success"
          isOpen={true}
          close={(): void => {}}
          heading={config.dashboardDefaults.fundingSnackbarHeading}
        >
          <Content>{config.dashboardDefaults.fundingSnackbarBody}</Content>
        </SnackbarAlert>
      </div>
    </ConfigContext.Provider>
  );
};

export default DashboardSnackbarsPreview;
