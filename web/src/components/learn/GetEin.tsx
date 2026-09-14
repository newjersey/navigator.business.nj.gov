import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

export const GetEin = (): ReactElement => {
  const { Config } = useConfig();

  return (
    <div>
      <Content>{Config.learnPageGetEin.overview}</Content>
      <Content>{Config.learnPageGetEin.callouts}</Content>
    </div>
  );
};
