import { type ConfigType, getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { merge } from "lodash";
import { useEffect, useState } from "react";
import type { PreviewProps } from "@/lib/cms/helpers/previewHelpers";

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
  }, [dataString]);

  return { config, setConfig };
};
