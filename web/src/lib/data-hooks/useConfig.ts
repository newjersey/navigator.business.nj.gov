import { ConfigContext, ConfigType } from "@/contexts/configContext";
import { useContext } from "react";

export const useConfig = (): { Config: ConfigType } => {
  const { config } = useContext(ConfigContext);
  return { Config: config };
};
