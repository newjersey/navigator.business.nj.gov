import { Content } from "@/components/Content";
import { Tag } from "@/components/njwds-extended/Tag";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import truncateMarkdown from "markdown-truncate";
import React, { ReactElement } from "react";

interface Opportunity {
  id: string;
  name: string;
  urlSlug: string;
  contentMd: string;
}

interface Props {
  opportunity: Opportunity;
  urlPath: "funding" | "certification";
}

const TYPE_TO_LABEL: Record<"funding" | "certification", ReactElement> = {
  funding: (
    <Tag tagVariant="baseBlack" hexColor="#D5A0E3">
      {Defaults.dashboardDefaults.fundingTagText}
    </Tag>
  ),
  certification: (
    <Tag tagVariant="baseBlack" hexColor="#b1b0e3">
      {Defaults.dashboardDefaults.certificationTagText}
    </Tag>
  ),
};

const MAX_CONTENT_CHARS = 150;

export const OpportunityCard = (props: Props): ReactElement => {
  const truncatedMd = truncateMarkdown(props.opportunity.contentMd, {
    limit: MAX_CONTENT_CHARS,
    ellipsis: true,
  });

  return (
    <div
      data-testid={props.opportunity.id}
      className="bg-base-lightest border-1px border-base-lighter padding-3 margin-bottom-205 radius-md"
    >
      <div className="display-inline-flex">{TYPE_TO_LABEL[props.urlPath]}</div>

      <h3 className="font-body-md text-normal h4-styling">
        <a className="usa-link" href={`/${props.urlPath}/${props.opportunity.urlSlug}`}>
          {props.opportunity.name}
        </a>
      </h3>
      <Content>{truncatedMd}</Content>
    </div>
  );
};
