import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { Tag } from "@/components/njwds-extended/Tag";
import { Icon } from "@/components/njwds/Icon";
import { useUserData } from "@/lib/data-hooks/useUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
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
      {Config.dashboardDefaults.fundingTagText}
    </Tag>
  ),
  certification: (
    <Tag tagVariant="baseBlack" hexColor="#b1b0e3">
      {Config.dashboardDefaults.certificationTagText}
    </Tag>
  ),
};

const MAX_CONTENT_CHARS = 150;

export const OpportunityCard = (props: Props): ReactElement => {
  const { userData, update } = useUserData();

  const truncatedMd = truncateMarkdown(props.opportunity.contentMd, {
    limit: MAX_CONTENT_CHARS,
    ellipsis: true,
  });

  const isHidden = (): boolean => {
    if (!userData) return false;
    const property = props.urlPath === "funding" ? "hiddenFundingIds" : "hiddenCertificationIds";
    return userData.preferences[property].includes(props.opportunity.id);
  };

  const hideSelf = async () => {
    if (!userData) return;
    const propertyToUpdate = props.urlPath === "funding" ? "hiddenFundingIds" : "hiddenCertificationIds";
    await update({
      ...userData,
      preferences: {
        ...userData.preferences,
        [propertyToUpdate]: [...userData.preferences[propertyToUpdate], props.opportunity.id],
      },
    });
  };

  const unhideSelf = async () => {
    if (!userData) return;
    const propertyToUpdate = props.urlPath === "funding" ? "hiddenFundingIds" : "hiddenCertificationIds";
    await update({
      ...userData,
      preferences: {
        ...userData.preferences,
        [propertyToUpdate]: userData.preferences[propertyToUpdate].filter(
          (it: string) => it !== props.opportunity.id
        ),
      },
    });
  };

  return (
    <div
      data-testid={props.opportunity.id}
      className="bg-base-lightest border-1px border-base-lighter padding-3 margin-bottom-205 radius-md"
    >
      <div className="fdr margin-bottom-105">
        <div className="margin-bottom-1">{TYPE_TO_LABEL[props.urlPath]}</div>
        <div className="mla">
          <Button style="narrow-light" onClick={() => (isHidden() ? unhideSelf() : hideSelf())}>
            <div className="fdr fac">
              <Icon>{isHidden() ? "visibility" : "visibility_off"}</Icon>
              <span className="margin-left-05">
                {isHidden()
                  ? Config.dashboardDefaults.unhideOpportunityText
                  : Config.dashboardDefaults.hideOpportunityText}
              </span>
            </div>
          </Button>
        </div>
      </div>
      <div className="text-normal font-body-md margin-bottom-1">
        <a className="usa-link" href={`/${props.urlPath}/${props.opportunity.urlSlug}`}>
          {props.opportunity.name}
        </a>
      </div>
      <div className="override-p-2xs">
        <Content>{truncatedMd}</Content>
      </div>
    </div>
  );
};
