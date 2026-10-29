import type { ReactElement } from "react";
import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";

interface Props {
  heading: string;
}

export const FindNaics = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <div>
      <h2 className="text-secondary-darker">{props.heading}</h2>
      <div className="grid-row grid-gap-2 flex-align-start">
        <div className="grid-col-12 tablet:grid-col-7">
          <Content>{Config.learnPageFindNaics.content}</Content>
        </div>
        <div className="grid-col-12 tablet:grid-col-5">
          <img
            className="width-100"
            src="/img/learn-find-naics-code.png"
            alt={Config.learnPageFindNaics.imageAlt}
          />
        </div>
      </div>
    </div>
  );
};
