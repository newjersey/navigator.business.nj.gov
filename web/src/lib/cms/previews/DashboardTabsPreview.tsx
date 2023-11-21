import { SidebarCardsList } from "@/components/dashboard/SidebarCardsList";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { generateCertification, generateFunding } from "@/test/factories";
import { ReactElement } from "react";

const DashboardTabsPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <SidebarCardsList
          topCards={[]}
          bottomCards={[]}
          fundings={[]}
          hiddenFundings={[]}
          certifications={[]}
          hiddenCertifications={[]}
          displayFundings={false}
          displayCertifications={false}
        />

        <SidebarCardsList
          topCards={[]}
          bottomCards={[]}
          fundings={[]}
          hiddenFundings={[]}
          certifications={[]}
          hiddenCertifications={[]}
          displayFundings={true}
          displayCertifications={true}
        />

        <SidebarCardsList
          topCards={[]}
          bottomCards={[]}
          fundings={[]}
          hiddenFundings={[]}
          certifications={[]}
          hiddenCertifications={[]}
          displayFundings={false}
          displayCertifications={false}
          isCMSPreview={true}
        />

        <SidebarCardsList
          topCards={[]}
          bottomCards={[]}
          fundings={[generateFunding({})]}
          hiddenFundings={[generateFunding({})]}
          certifications={[generateCertification({})]}
          hiddenCertifications={[generateCertification({})]}
          displayFundings={true}
          displayCertifications={true}
        />
      </div>
    </ConfigContext.Provider>
  );
};

export default DashboardTabsPreview;
