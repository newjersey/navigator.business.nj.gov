import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

export const FindNaics = (): ReactElement => {
  const { Config } = useConfig();

  return <Content className="margin-bottom-5">{Config.learnPageFindNaics.content}</Content>;
};
