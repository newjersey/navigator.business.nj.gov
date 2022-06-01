/* eslint-disable @typescript-eslint/no-explicit-any */
import { OnboardingBusinessPersona } from "@/components/onboarding/OnboardingBusinessPersona";
import { OnboardingLegalStructure } from "@/components/onboarding/OnboardingLegalStructure";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import { getMetadataFromSlug } from "@/lib/cms/previews/preview-helpers";
import merge from "lodash.merge";
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

const ProfilePreviewOnboarding = (props: Props) => {
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

  const { businessPersona } = getMetadataFromSlug(props.entry.toJS().slug);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <OnboardingBusinessPersona />
        {businessPersona === "STARTING" && (
          <>
            <hr className="margin-y-4" />
            <OnboardingLegalStructure />
          </>
        )}
      </div>
    </ConfigContext.Provider>
  );
};

export default ProfilePreviewOnboarding;
