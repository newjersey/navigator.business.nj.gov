import { ConfigContext, ConfigType } from "@businessnjgovnavigator/shared/contexts/configContext";
import { useContext } from "react";

export const useConfig = (): { Config: ConfigType } => {
  const { config } = useContext(ConfigContext);
  return { Config: config };
};
