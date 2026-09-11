import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

export const FormBusiness = (): ReactElement => {
  const { Config } = useConfig();

  return (
    <div>
      <Content>{Config.learnPageFormBusiness.overview}</Content>
      <br></br>
      <HorizontalLine />
      <Content>{Config.learnPageFormBusiness.firstSection}</Content>
      <br></br>
      <HorizontalLine />
      <Content>{Config.learnPageFormBusiness.secondSection}</Content>
      <br></br>
      <HorizontalLine />
      <Content>{Config.learnPageFormBusiness.moreInfo}</Content>
    </div>
  );
};
