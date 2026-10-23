import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  heading: string;
}

export const FormBusiness = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const h2Override = ({ children }: { children: string[] }): ReactElement => (
    <h2 className="text-secondary-darker" style={{ marginTop: "1rem" }}>
      {children}
    </h2>
  );

  return (
    <>
      <h2 className="text-secondary-darker">{props.heading}</h2>
      <Content>{Config.learnPageFormBusiness.overview}</Content>
      <br></br>
      <div className="grid-row grid-gap-4 flex-align-start">
        <div className="grid-col-12 tablet:grid-col-5">
          <img
            className="width-100"
            src="/img/learn-business-name-availability.png"
            alt={Config.learnPageFormBusiness.nameAvailabilityImageAlt}
          />
        </div>
        <div className="grid-col-12 tablet:grid-col-7">
          <h3 className="text-accent-cool-darker">
            {Config.learnPageFormBusiness.firstSectionHeader}
          </h3>
          <Content>{Config.learnPageFormBusiness.firstSection}</Content>
        </div>
      </div>
      <br></br>
      <HorizontalLine />
      <div className="grid-row grid-gap-2 flex-align-start">
        <div className="grid-col-12 tablet:grid-col-7">
          <h3 className="text-accent-cool-darker">
            {Config.learnPageFormBusiness.secondSectionHeader}
          </h3>
          <Content>{Config.learnPageFormBusiness.secondSection}</Content>
        </div>
        <div className="grid-col-12 tablet:grid-col-5">
          <img
            className="width-100"
            src="/img/learn-business-details.png"
            alt={Config.learnPageFormBusiness.businessDetailsImageAlt}
          />
        </div>
      </div>
      <br></br>
      <Content overrides={{ h2: h2Override }}>{Config.learnPageFormBusiness.moreInfo}</Content>
    </>
  );
};
