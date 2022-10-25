import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { Tag } from "@/components/njwds-extended/Tag";
import { Icon } from "@/components/njwds/Icon";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Opportunity } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import truncateMarkdown from "markdown-truncate";
import { ReactElement } from "react";
import { OpportunityCardStatus } from "./OpportunityCardStatus";

interface Props {
  opportunity: Opportunity;
  urlPath: "funding" | "certification";
  isLast?: boolean;
}

const TYPE_TO_LABEL: Record<"funding" | "certification", ReactElement> = {
  funding: <Tag backgroundColor="info-light">{Config.dashboardDefaults.fundingTagText}</Tag>,
  certification: (
    <Tag backgroundColor="accent-cool-light">{Config.dashboardDefaults.certificationTagText}</Tag>
  ),
};

const MAX_CONTENT_CHARS = 150;

export const OpportunityCard = (props: Props): ReactElement => {
  const { userData, update } = useUserData();

  const truncatedMd = truncateMarkdown(props.opportunity.descriptionMd, {
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
      className={`bg-white border-1px border-base-lighter padding-3 desktop:margin-right-105 radius-md${
        props.isLast ? "" : " margin-bottom-205"
      }`}
    >
      <div className="fdr margin-bottom-105">
        <div>{TYPE_TO_LABEL[props.urlPath]}</div>
        <div className="mla">
          <Button style="narrow-light" onClick={() => (isHidden() ? unhideSelf() : hideSelf())}>
            <div className="fdr fac">
              <Icon>{isHidden() ? "visibility" : "visibility_off"}</Icon>
              <span className="margin-left-05 line-height-sans-2">
                {isHidden()
                  ? Config.dashboardDefaults.unHideOpportunityText
                  : Config.dashboardDefaults.hideOpportunityText}
              </span>
            </div>
          </Button>
        </div>
      </div>
      <div className="text-normal font-body-md margin-bottom-105">
        <a className="usa-link" href={`/${props.urlPath}/${props.opportunity.urlSlug}`}>
          {props.opportunity.name}
        </a>
      </div>
      <OpportunityCardStatus dueDate={props.opportunity.dueDate} status={props.opportunity.status} />
      <div className="override-p-2xs text-base-dark">
        <Content>{truncatedMd}</Content>
      </div>
    </div>
  );
};
