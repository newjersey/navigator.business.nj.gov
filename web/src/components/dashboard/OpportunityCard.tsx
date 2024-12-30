import { OpportunityCardStatus } from "@/components/dashboard/OpportunityCardStatus";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { Tag } from "@/components/njwds-extended/Tag";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Opportunity } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { capitalizeEachWord } from "@/lib/utils/cases-helpers";
import { truncate } from "lodash";
import { useRouter } from "next/compat/router";
import { ReactElement } from "react";

interface Props {
  opportunity: Opportunity;
  urlPath: "funding" | "certification";
  isLast?: boolean;
}

export const OPPORTUNITY_CARD_MAX_BODY_CHARS = 150;

export const OpportunityCard = (props: Props): ReactElement => {
  const { updateQueue, business } = useUserData();
  const { Config } = useConfig();
  const router = useRouter();

  const TYPE_TO_LABEL: Record<"funding" | "certification", ReactElement> = {
    funding: (
      <Tag isLowerCase={true} backgroundColor="accent-semi-cool-light">
        {capitalizeEachWord(Config.dashboardDefaults.fundingTagText)}
      </Tag>
    ),
    certification: (
      <Tag isLowerCase={true} backgroundColor="accent-cool-lighter-border-darktext">
        {capitalizeEachWord(Config.dashboardDefaults.certificationTagText)}
      </Tag>
    ),
  };

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
    router && router.push(url);
  };

  return (
    <>
      <hr className="bg-cool-lighter" aria-hidden={true} />
      <div
        data-testid={props.opportunity.id}
        className={`${props.isLast ? "" : " margin-bottom-205"} margin-top-3`}
      >
        <div className="fdr margin-bottom-105">
          <div>{TYPE_TO_LABEL[props.urlPath]}</div>
          <div className="mla">
            <SecondaryButton
              size={"small"}
              isColor={"border-base-light"}
              onClick={(): void => {
                isHidden() ? unhideSelf() : hideSelf();
              }}
            >
              <div className="fdr fac">
                <Icon iconName={isHidden() ? "visibility" : "visibility_off"} />
                <span className="margin-left-05 line-height-sans-2">
                  {isHidden()
                    ? Config.dashboardDefaults.unHideOpportunityText
                    : Config.dashboardDefaults.hideOpportunityText}
                </span>
              </div>
            </SecondaryButton>
          </div>
        </div>
        <div className="text-normal font-body-md margin-bottom-105">
          <UnStyledButton isUnderline onClick={routeToPage}>
            {props.opportunity.name}
          </UnStyledButton>
        </div>
        <OpportunityCardStatus dueDate={props.opportunity.dueDate} status={props.opportunity.status} />
        <div className="override-p-2xs text-base-dark">
          {truncate(props.opportunity.sidebarCardBodyText, { length: OPPORTUNITY_CARD_MAX_BODY_CHARS })}
        </div>
      </div>
    </>
  );
};
