import { Icon } from "@/components/njwds/Icon";
import React, { ReactElement } from "react";

interface Props {
  label: string;
  icon: string;
  subLabel?: string;
  downloadLink?: string;
}

export const FormationSuccessDocument = (props: Props): ReactElement => {
  const contents = (
    <div className="margin-1 bg-base-lightest padding-1 fdr fac">
      <img src={`/img/${props.icon}.svg`} alt="" />
      <div className="margin-left-1 line-height-body-2">
        <div className={props.subLabel ? "text-bold" : ""}>{props.label}</div>
        {props.subLabel && <div>{props.subLabel}</div>}
      </div>
      {props.downloadLink && <Icon className="mla font-body-xl text-green">file_download</Icon>}
    </div>
  );

  return (
    <div className="flex-half-tablet">
      {!props.downloadLink ? (
        contents
      ) : (
        <a data-testid={props.label} className="no-link-style text-base-darkest" href={props.downloadLink}>
          {contents}
        </a>
      )}
    </div>
  );
};
