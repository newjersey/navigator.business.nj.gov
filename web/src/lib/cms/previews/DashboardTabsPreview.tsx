import { SidebarCardsList } from "@/components/dashboard/SidebarCardsList";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { generateCertification, generateFunding } from "@/test/factories";
import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import { ReactElement } from "react";

const DashboardTabsPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <div className="h3-styling margin-y-2">
          ----- When Certs/Fundings Are Not Displayed -----
        </div>
        <SidebarCardsList sideBarCards={[]} fundings={[]} certifications={[]} cardCount={0} />
        <div className="h3-styling margin-y-2">----- When Certs/Fundings Are Displayed -----</div>
        <SidebarCardsList
          sideBarCards={[]}
          fundings={[]}
          certifications={[]}
          displayCertificationsCards
          displayFundingCards
          cardCount={0}
        />

        <div className="h3-styling margin-y-2">----- When Remote Seller / Worker -----</div>
        <SidebarCardsList
          sideBarCards={[]}
          fundings={[]}
          certifications={[]}
          isRemoteSellerWorker={true}
          cardCount={0}
        />

        <div className="h3-styling margin-y-2">----- When Certs/Fundings Are Displayed -----</div>
        <SidebarCardsList
          sideBarCards={[]}
          fundings={[generateFunding({})]}
          certifications={[generateCertification({})]}
          displayCertificationsCards
          displayFundingCards
          cardCount={5}
        />
      </div>
    </ConfigContext.Provider>
  );
};

export default DashboardTabsPreview;
