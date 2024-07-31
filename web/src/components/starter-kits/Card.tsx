import { Heading } from "@/components/njwds-extended/Heading";
import { ReactElement } from "react";

export const Card = (props: { iconFilename: string; title: string; description: string }): ReactElement => {
  return (
    <>
      <div className="display-none-desktop border-1px shadow-2 padding-3 radius-lg border-gray-10 display-flex flex-column gap-2">
        <div className="display-flex gap-2 flex-align-center">
          <img
            className="height-5 width-5"
            src={`/img/${props.iconFilename}.svg`}
            aria-hidden="true"
            alt=""
          />
          <h3 className="margin-0">
            <b>{props.title}</b>
          </h3>
        </div>
        <p className="text-base-dark">{props.description}</p>
      </div>
      <div className="display-only-desktop border-1px shadow-2 radius-lg border-gray-10 display-flex gap-4 padding-4 flex-align-center">
        <img className="height-8 width-8" src={`/img/${props.iconFilename}.svg`} aria-hidden="true" alt="" />
        <div className="display-flex flex-column">
          <Heading level={3}>{props.title}</Heading>
          <p className="text-base-dark">{props.description}</p>
        </div>
      </div>
    </>
  );
};
