import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { useSidebarCards } from "@/lib/data-hooks/useSidebarCards";
import { SidebarCardContent } from "@/lib/types/types";
import { ReactElement } from "react";
import { ModifiedContent } from "../ModifiedContent";

type Props = {
  card: SidebarCardContent;
  preBodyButtonOnClick?: () => void;
  ctaOnClick?: () => void;
};

export const SidebarCardGeneric = (props: Props): ReactElement<any> => {
  const { hideCard } = useSidebarCards();

  const closeSelf = async (): Promise<void> => {
    await hideCard(props.card.id);
  };

  const sideBarCardGradientBackground: { [key: string]: string } = {
    "formation-nudge": "primary-gradient",
    "funding-nudge": "primary-gradient-reverse",
    "go-to-profile": "secondary-gradient-reverse",
    "not-registered-up-and-running": "tertiary-gradient",
    "not-registered": "tertiary-gradient-reverse",
  };

  const ctaButton = (
    <PrimaryButton
      isColor="white"
      onClick={props.ctaOnClick}
      isRightMarginRemoved={true}
      dataTestId={`cta-${props.card.id}`}
      isFullWidthOnDesktop={true}
    >
      {props.card.ctaText}
    </PrimaryButton>
  );

  return (
    <>
      <div
        className={`padding-3 radius-md margin-bottom-3 ${sideBarCardGradientBackground[props.card.id]}`}
        {...{ "data-testid": props.card.id }}
      >
        {props.card.header && (
          <div className="radius-top-md">
            <div className="flex flex-justify">
              <Heading level={3} className="margin-0-override text-white">
                <span>
                  <ModifiedContent>{props.card.header}</ModifiedContent>
                </span>
              </Heading>
              {props.card.hasCloseButton && (
                <UnStyledButton onClick={closeSelf} ariaLabel="Close">
                  <Icon className="font-sans-xl text-white" iconName="close" />
                </UnStyledButton>
              )}
            </div>
          </div>
        )}
        <div
          className={`padding-top-205 text-base radius-bottom-md text-white ${
            !props.card.header && "radius-top-md"
          }`}
        >
          {props.card.preBodySpanButtonText && (
            <UnStyledButton
              isTextBold
              onClick={props.preBodyButtonOnClick}
              dataTestid={`${props.card.id}-preBodyButtonText`}
            >
              <span className="text-white text-underline margin-right-05">
                {props.card.preBodySpanButtonText}
              </span>
            </UnStyledButton>
          )}
          <Content className="text-white display-inline anchor-element-text-white-override go-to-profile-display-inline-children-p">
            {props.card.contentMd}
          </Content>
          {props.ctaOnClick && props.card.ctaText && (
            <div className="margin-top-205 flex flex-justify-center desktop:flex-justify-end">
              {ctaButton}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
