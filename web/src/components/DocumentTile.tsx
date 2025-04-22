import { Content } from "@/components/Content";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { ReactElement } from "react";

interface Props {
  label: string;
  icon: string;
  subLabel?: string;
  downloadLink?: string;
  downloadFilename?: string;
  isCentered?: boolean;
  isRounded?: boolean;
  hasExtraPadding?: boolean;
  onClick?: () => void;
  isWidthFull?: boolean;
  hasDownloadIcon?: boolean;
}

export const DocumentTile = (props: Props): ReactElement => {
  const showDownloadIcon = props.downloadLink || props.hasDownloadIcon;
  const hasExtraPadding = props.hasExtraPadding ? "padding-205" : "padding-1";
  const hasExtraSpacing = props.hasExtraPadding
    ? "margin-x-2"
    : "margin-left-1";
  const isRounded = props.isRounded ? "radius-md" : "";
  const isWidthFull = props.isWidthFull ? "width-100-override" : "";

  const tile = (
    <div
      className={`flex flex-align-center bg-base-lightest
      ${hasExtraPadding} ${isWidthFull} ${isRounded}
      ${props.isCentered ? "flex-justify-center" : ""}`}
    >
      <img src={`/img/${props.icon}.svg`} alt="" />
      <div
        className={`${hasExtraSpacing} line-height-body-2 text-base-darkest`}
      >
        <Content>{props.label}</Content>
        {props.subLabel && <Content>{props.subLabel}</Content>}
      </div>
      {showDownloadIcon && (
        <Icon
          className={`${props.isCentered ? "" : "mla"} font-body-xl text-green`}
          iconName="file_download"
        />
      )}
    </div>
  );

  if (props.onClick) {
    return (
      <UnStyledButton isWidthFull={props.isWidthFull} onClick={props.onClick}>
        {tile}
      </UnStyledButton>
    );
  }

  if (props.downloadLink) {
    return (
      <a
        data-testid={props.label}
        className="no-link-style text-base-darkest"
        href={props.downloadLink}
        download={props.downloadFilename}
        target="_blank"
        rel="noreferrer noopener"
      >
        {tile}
      </a>
    );
  }

  return <>{tile}</>;
};
