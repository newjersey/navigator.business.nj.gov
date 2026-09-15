import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

export const FormBusiness = (): ReactElement => {
  const { Config } = useConfig();

  return (
    <>
      <Content>{Config.learnPageFormBusiness.overview}</Content>
      <br></br>
      <HorizontalLine />
      <h3>{Config.learnPageFormBusiness.firstSectionHeader}</h3>
      <Content>{Config.learnPageFormBusiness.firstSection}</Content>
      <br></br>
      <HorizontalLine />
      <h3>{Config.learnPageFormBusiness.secondSectionHeader}</h3>
      <Content>{Config.learnPageFormBusiness.secondSection}</Content>
      <br></br>
      <HorizontalLine />
      <Content>{Config.learnPageFormBusiness.moreInfo}</Content>
    </>
  );
};
