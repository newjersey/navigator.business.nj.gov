import { ConfigContext, ConfigType } from "@businessnjgovnavigator/shared";
import { useContext } from "react";

export const useConfig = (): { Config: ConfigType } => {
  const { config } = useContext(ConfigContext);
  return { Config: config };
};
