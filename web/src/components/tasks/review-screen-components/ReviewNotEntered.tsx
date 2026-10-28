import type { ReactElement } from "react";
import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";

export const ReviewNotEntered = (): ReactElement => {
  const { Config } = useConfig();
  return (
    <Content className={"width-max-content bg-accent-warm-extra-light text-italic"}>
      {Config.formation.general.notEntered}
    </Content>
  );
};
