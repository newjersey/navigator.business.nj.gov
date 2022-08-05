/* eslint-disable @typescript-eslint/no-explicit-any */
import { Content } from "@/components/Content";
import { CannabisApplyForLicenseTask } from "@/components/tasks/cannabis/CannabisApplyForLicenseTask";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import { getMetadataFromSlug } from "@/lib/cms/previews/preview-helpers";
import { generateProfileData, generateTask, generateUserData } from "@/test/factories";
import { merge } from "lodash";
import { useEffect, useRef, useState } from "react";

type Props = {
  entry?: any;
  window: Window;
  document: Document;
  fieldsMetaData: any;
  widgetsFor: (string: string) => any;
  widgetFor: (string: string) => any;
  getAsset: (string: string) => any;
};

const CannabisLicensePreview = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref?.current?.ownerDocument.head.replaceWith(props.window.parent.document.head.cloneNode(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const [config, setConfig] = useState<ConfigType>(getMergedConfig());

  const data = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));
  const dataString = JSON.stringify(data);

  useEffect(() => {
    setConfig(JSON.parse(JSON.stringify(merge(config, data))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataString]);

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
