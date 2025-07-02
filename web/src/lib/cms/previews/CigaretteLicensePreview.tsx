import { CigaretteLicense } from "@/components/tasks/cigarette-license/CigaretteLicense";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ReactElement } from "react";

const cigaretteTask = {
  id: "cigarette-license",
  filename: "cigarette-license",
  name: "Apply for Your Cigarette License",
  urlSlug: "cigarette-license",
  callToActionLink: "https://www.njportal.com/DOR/CM100/Content/pdfs/cm100CigApp.pdf ",
  callToActionText: "Apply for My Cigarette License",
  contentMd: "",
  summaryDescriptionMd: "",
  unlockedBy: [],
};

const CigaretteLicensePreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);
  const [, tab] = props.entry.toJS().slug.split("-");

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        {tab === "step1" && (
          <>
            <CigaretteLicense task={cigaretteTask} />
          </>
        )}
      </div>
    </ConfigContext.Provider>
  );
};

export default CigaretteLicensePreview;
