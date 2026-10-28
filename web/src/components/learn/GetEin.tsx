import type { ReactElement } from "react";
import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";

interface Props {
  heading: string;
}

export const GetEin = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <div>
      <h2 className="text-secondary-darker">{props.heading}</h2>
      <div className="grid-row grid-gap-2 flex-align-start">
        <div className="grid-col-12 tablet:grid-col-7">
          <Content>{Config.learnPageGetEin.overview}</Content>
        </div>
        <div className="grid-col-12 tablet:grid-col-5">
          <img
            className="width-100"
            src="/img/learn-get-ein.png"
            alt={Config.learnPageGetEin.imageAlt}
          />
        </div>
      </div>
      <Content>{Config.learnPageGetEin.callouts}</Content>
    </div>
  );
};
