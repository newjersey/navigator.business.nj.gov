import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

export const ReviewNotEntered = (): ReactElement<any> => {
  const { Config } = useConfig();
  return (
    <Content className={"width-max-content bg-accent-warm-extra-light text-italic"}>
      {Config.formation.general.notEntered}
    </Content>
  );
};
