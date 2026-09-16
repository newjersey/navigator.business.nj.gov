import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  heading: string;
}

export const RegisterTaxes = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <div>
      <h2>{props.heading}</h2>
      <Content>{Config.learnPageRegisterTaxes.overview}</Content>
      <Content className="margin-top-4">{Config.learnPageRegisterTaxes.callouts}</Content>
    </div>
  );
};
