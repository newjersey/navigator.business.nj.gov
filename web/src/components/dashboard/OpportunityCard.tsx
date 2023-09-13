import { Content } from "@/components/Content";
import { OpportunityCardStatus } from "@/components/dashboard/OpportunityCardStatus";
import { Tag } from "@/components/njwds-extended/Tag";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Opportunity } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import truncateMarkdown from "markdown-truncate";
import { useRouter } from "next/router";
import { ReactElement } from "react";

interface Props {
  opportunity: Opportunity;
  urlPath: "funding" | "certification";
  isLast?: boolean;
}

const MAX_CONTENT_CHARS = 150;

export const OpportunityCard = (props: Props): ReactElement => {
  const { updateQueue, business } = useUserData();
  const { Config } = useConfig();
  const router = useRouter();

  const TYPE_TO_LABEL: Record<"funding" | "certification", ReactElement> = {
    funding: <Tag backgroundColor="accent-semi-cool-light">{Config.dashboardDefaults.fundingTagText}</Tag>,
    certification: (
      <Tag backgroundColor="accent-cool-light">{Config.dashboardDefaults.certificationTagText}</Tag>
    ),
  };

  const truncatedMd = truncateMarkdown(props.opportunity.descriptionMd, {
    limit: MAX_CONTENT_CHARS,
    ellipsis: true,
  });

  const isHidden = (): boolean => {
    if (!business) {
      return false;
    }
    const property = props.urlPath === "funding" ? "hiddenFundingIds" : "hiddenCertificationIds";
    return business.preferences[property].includes(props.opportunity.id);
  };

  const hideSelf = async (): Promise<void> => {
    if (!business || !updateQueue) {
      return;
    }
    const propertyToUpdate = props.urlPath === "funding" ? "hiddenFundingIds" : "hiddenCertificationIds";
    analytics.event.for_you_card_hide_button.click.hide_card();
    await updateQueue
      .queuePreferences({
        [propertyToUpdate]: [...business.preferences[propertyToUpdate], props.opportunity.id],
      })
      .update();
  };

  const unhideSelf = async (): Promise<void> => {
    if (!business || !updateQueue) {
      return;
    }
    const propertyToUpdate = props.urlPath === "funding" ? "hiddenFundingIds" : "hiddenCertificationIds";
    analytics.event.for_you_card_unhide_button.click.unhide_card();
    await updateQueue
      .queuePreferences({
        [propertyToUpdate]: business.preferences[propertyToUpdate].filter((it: string) => {
          return it !== props.opportunity.id;
        }),
      })
      .update();
  };

  const routeToPage = (): void => {
    const url = `/${props.urlPath}/${props.opportunity.urlSlug}`;
    analytics.event.opportunity_card.click.go_to_opportunity_screen();
    router.push(url);
  };

  return (
    <div
      data-testid={props.opportunity.id}
      className={`bg-white border-1px border-base-lighter padding-3 radius-md${
        props.isLast ? "" : " margin-bottom-205"
      }`}
    >
      <div className="fdr margin-bottom-105">
        <div>{TYPE_TO_LABEL[props.urlPath]}</div>
        <div className="mla">
          <UnStyledButton
            style={"transparentBgColor"}
            className={"usa-tag text-normal text-base border-1px border-base-light hide-unhide-button"}
            onClick={(): void => {
              isHidden() ? unhideSelf() : hideSelf();
            }}
          >
            <div className="fdr fac">
              <Icon>{isHidden() ? "visibility" : "visibility_off"}</Icon>
              <span className="margin-left-05 line-height-sans-2">
                {isHidden()
                  ? Config.dashboardDefaults.unHideOpportunityText
                  : Config.dashboardDefaults.hideOpportunityText}
              </span>
            </div>
          </UnStyledButton>
        </div>
      </div>
      <div className="text-normal font-body-md margin-bottom-105">
        <UnStyledButton style={"default"} isUnderline onClick={routeToPage}>
          {props.opportunity.name}
        </UnStyledButton>
      </div>
      <OpportunityCardStatus dueDate={props.opportunity.dueDate} status={props.opportunity.status} />
      <div className="override-p-2xs text-base-dark">
        <Content>{truncatedMd}</Content>
      </div>
    </div>
  );
};
