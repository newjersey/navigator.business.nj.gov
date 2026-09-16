import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

export const OpenAccount = (): ReactElement => {
  const { Config } = useConfig();

  return (
    <>
      <h2>{Config.learnPageOpenAccount.heading}</h2>
      <Content>{Config.learnPageOpenAccount.content}</Content>
    </>
  );
};
