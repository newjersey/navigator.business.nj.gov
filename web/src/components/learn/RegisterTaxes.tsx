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
      <h2 className="text-secondary-darker">{props.heading}</h2>
      <div className="grid-row grid-gap-2 flex-align-start">
        <div className="grid-col-12 tablet:grid-col-7">
          <Content>{Config.learnPageRegisterTaxes.overview}</Content>
        </div>
        <div className="grid-col-12 tablet:grid-col-5">
          <img
            className="width-100"
            src="/img/learn-register-taxes.png"
            alt={Config.learnPageRegisterTaxes.imageAlt}
          />
        </div>
      </div>
      <Content className="margin-top-4">{Config.learnPageRegisterTaxes.callouts}</Content>
    </div>
  );
};
