import { Content } from "@/components/Content";
import { Tag } from "@/components/njwds-extended/Tag";
import { DashboardDefaults } from "@/display-defaults/dashboard/DashboardDefaults";
import { Opportunity, OpportunityType } from "@/lib/types/types";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import truncateMarkdown from "markdown-truncate";
import React, { ReactElement } from "react";

interface Props {
  opportunity: Opportunity;
}

const TYPE_TO_LABEL: Record<OpportunityType, ReactElement> = {
  FUNDING: (
    <Tag tagVariant="baseBlack" hexColor="#D5A0E3">
      {DashboardDefaults.fundingTagText}
    </Tag>
  ),
  CERTIFICATION: (
    <Tag tagVariant="baseBlack" hexColor="#b1b0e3">
      {DashboardDefaults.certificationTagText}
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
      <div className="display-inline-flex">{TYPE_TO_LABEL[props.opportunity.type]}</div>

      <h3 className="font-body-md text-normal">
        <a className="usa-link" href={`/opportunities/${props.opportunity.urlSlug}`}>
          {props.opportunity.name}
        </a>
      </h3>
      <Content>{truncatedMd}</Content>
    </div>
  );
};
