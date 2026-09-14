import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

export const FindNaics = (): ReactElement => {
  const { Config } = useConfig();

  return <Content>{Config.learnPageFindNaics.content}</Content>;
};
