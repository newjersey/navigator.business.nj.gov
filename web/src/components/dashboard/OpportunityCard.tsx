import { Tag } from "@/components/njwds-extended/Tag";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { capitalizeEachWord } from "@/lib/utils/cases-helpers";
import { Opportunity } from "@businessnjgovnavigator/shared/types";
import { truncate } from "lodash";
import { useRouter } from "next/compat/router";
import { ReactElement } from "react";

interface Props {
  opportunity: Opportunity;
  urlPath: "funding" | "certification";
  isLast?: boolean;
  removeHideButton?: boolean;
  removeLabel?: boolean;
  hideTopBorder?: boolean;
}

export const OPPORTUNITY_CARD_MAX_BODY_CHARS = 150;

export const OpportunityCard = (props: Props): ReactElement => {
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

  const routeToPage = (): void => {
    const url = `/${props.urlPath}/${props.opportunity.urlSlug}`;
    analytics.event.opportunity_card.click.go_to_opportunity_screen();
    router && router.push(url);
  };

  return (
    <>
      {!props.hideTopBorder && <hr className="bg-cool-lighter" aria-hidden={true} />}

      <div
        data-testid={props.opportunity.id}
        className={`${props.isLast ? "" : " margin-bottom-205"} margin-top-3`}
      >
        <div className="fdr margin-bottom-105">
          {!props.removeLabel && <div>{TYPE_TO_LABEL[props.urlPath]}</div>}
        </div>
        <div className="text-normal font-body-md margin-bottom-105">
          <UnStyledButton
            isUnderline
            onClick={routeToPage}
            dataTestid={`${props.opportunity.id}-button`}
          >
            {props.opportunity.name}
          </UnStyledButton>
        </div>
        {props.opportunity.dueDate && (
          <div className="dashboard-opportunity-card-due-date">
            <span className="dashboard-opportunity-card-due-date-header">Due: </span>
            {props.opportunity.dueDate}{" "}
          </div>
        )}
        <div className="override-p-2xs text-base-dark">
          {truncate(props.opportunity.sidebarCardBodyText, {
            length: OPPORTUNITY_CARD_MAX_BODY_CHARS,
          })}
        </div>
      </div>
    </>
  );
};
