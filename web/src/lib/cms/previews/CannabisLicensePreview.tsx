import { Content } from "@/components/Content";
import { CannabisApplyForLicenseTask } from "@/components/tasks/cannabis/CannabisApplyForLicenseTask";
import { ConfigContext } from "@/contexts/configContext";
import { getMetadataFromSlug, PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { generateProfileData, generateTask, generateUserData } from "@/test/factories";

const CannabisLicensePreview = (props: PreviewProps) => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const { tab } = getMetadataFromSlug(props.entry.toJS().slug);
  const isAnnual = props.entry.toJS().slug.includes("Annual");
  const isConditional = props.entry.toJS().slug.includes("Conditional");

  const eachUniquePriorityTypeSelected = generateUserData({
    profileData: generateProfileData({ cannabisMicrobusiness: true }),
    taskItemChecklist: {
      "general-minority-owned": true,
      "general-dvob": true,
      "cannabis-business-in-impact-zone": true,
      "cannabis-economically-disadvantaged-social-equity": true,
    },
  });

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        {tab === "1" && (
          <>
            <h2>No Priority Status Selected</h2>
            <Content>{config.cannabisApplyForLicense.priorityStatusNoneSelectedText}</Content>
            <hr className="margin-y-5" />
            <h2 className="margin-bottom-5">Priority Status Selected</h2>
          </>
        )}
        <CannabisApplyForLicenseTask
          task={generateTask({ name: "Name is controlled by Task Metadata" })}
          CMS_ONLY_tab={tab}
          CMS_ONLY_fakeUserData={eachUniquePriorityTypeSelected}
          CMS_ONLY_isAnnual={isAnnual}
          CMS_ONLY_isConditional={isConditional}
        />
      </div>
    </ConfigContext.Provider>
  );
};

export default CannabisLicensePreview;
