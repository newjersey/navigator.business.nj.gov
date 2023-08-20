import { ConfigType, getMergedConfig } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { merge } from "lodash";
import { useEffect, useState } from "react";

export const usePreviewConfig = (
  props: PreviewProps,
): { config: ConfigType; setConfig: (config: ConfigType) => void } => {
  const [config, setConfig] = useState<ConfigType>(getMergedConfig());

  const data = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));
  const dataString = JSON.stringify(data);

  useEffect(() => {
    setConfig((prevConfig) => {
      return JSON.parse(JSON.stringify(merge(prevConfig, data)));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataString]);

  return { config, setConfig };
};
