import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  heading: string;
}

export const FindNaics = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <>
      <h2>{props.heading}</h2>
      <Content className="margin-bottom-5">{Config.learnPageFindNaics.content}</Content>
    </>
  );
};
