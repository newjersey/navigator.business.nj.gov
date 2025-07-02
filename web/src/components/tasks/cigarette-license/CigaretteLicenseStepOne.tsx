import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

export const CigaretteLicenseStepOne = (): ReactElement => {
  const { Config } = useConfig();

  return (
    <>
      <Alert variant={"info"}>
        <Content>{Config.cigaretteLicenseStep1.alert}</Content>
      </Alert>
      <Content>{Config.cigaretteLicenseStep1.content}</Content>
    </>
  );
};
