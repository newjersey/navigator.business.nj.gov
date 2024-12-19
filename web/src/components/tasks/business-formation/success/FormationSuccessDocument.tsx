import { Content } from "@/components/Content";
import { Icon } from "@/components/njwds/Icon";
import { ReactElement } from "react";

interface Props {
  label: string;
  icon: string;
  subLabel?: string;
  downloadLink?: string;
}

export const FormationSuccessDocument = (props: Props): ReactElement<any> => {
  const contents = (
    <div className="margin-1 bg-base-lightest padding-1 fdr fac">
      <img src={`/img/${props.icon}.svg`} alt="" />
      <div className="margin-left-1 line-height-body-2">
        <Content>{props.label}</Content>
        {props.subLabel && <Content>{props.subLabel}</Content>}
      </div>
      {props.downloadLink && <Icon className="mla font-body-xl text-green" iconName="file_download" />}
    </div>
  );

  return (
    <div className="flex-half-tablet">
      {props.downloadLink ? (
        <a
          data-testid={props.label}
          className="no-link-style text-base-darkest"
          href={props.downloadLink}
          target="_blank"
          rel="noreferrer noopener"
        >
          {contents}
        </a>
      ) : (
        contents
      )}
    </div>
  );
};
