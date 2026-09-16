import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

export const RegisterTaxes = (): ReactElement => {
  const { Config } = useConfig();

  return (
    <div>
      <Content>{Config.learnPageRegisterTaxes.overview}</Content>
      <Content className="margin-top-4">{Config.learnPageRegisterTaxes.callouts}</Content>
    </div>
  );
};
