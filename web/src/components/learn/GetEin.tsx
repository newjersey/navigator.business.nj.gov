import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  heading: string;
}

export const GetEin = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <div>
      <h2>{props.heading}</h2>
      <Content>{Config.learnPageGetEin.overview}</Content>
      <Content>{Config.learnPageGetEin.callouts}</Content>
    </div>
  );
};
