import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { useSidebarCards } from "@/lib/data-hooks/useSidebarCards";
import { SidebarCardContent } from "@/lib/types/types";
import { ReactNode } from "react";

type Props = {
  card: SidebarCardContent;
  bodyText: string;
  headerText: string | undefined;
  preBodyContent?: ReactNode;
  ctaOnClick?: () => void;
};

export const SidebarCardGeneric = (props: Props) => {
  const { hideCard } = useSidebarCards();

  const closeSelf = async () => {
    await hideCard(props.card.id);
  };

  return (
    <>
      <div
        className={`border radius-md border-${props.card.borderColor} desktop:margin-right-3 margin-bottom-3`}
        {...{ "data-testid": props.card.id }}
      >
        {props.headerText && (
          <div
            className={`bg-${props.card.headerBackgroundColor} padding-y-105 padding-x-205 ${
              props.card.headerBackgroundColor === "white" ? "padding-top-105 padding-bottom-105" : ""
            } radius-top-md`}
          >
            <div className="flex flex-justify">
              <h3
                className={`margin-bottom-0 text-${props.card.color} ${
                  props.card.imgPath ? "flex flex-align-start" : ""
                }`}
              >
                {props.card.imgPath && (
                  <img
                    role="presentation"
                    className="margin-right-2 height-4 width-4"
                    src={props.card.imgPath}
                    alt=""
                  />
                )}
                <span className={props.card.imgPath ? "margin-top-2px padding-top-1px" : ""}>
                  {props.headerText}
                </span>
              </h3>
              {props.card.hasCloseButton && (
                <Button style="tertiary" onClick={closeSelf} ariaLabel="Close">
                  <Icon className={`font-sans-xl text-${props.card.color}`}>close</Icon>
                </Button>
              )}
            </div>
          </div>
        )}
        <div
          className={`bg-white padding-205 text-base radius-bottom-md ${
            !props.card.header && "radius-top-md"
          }`}
        >
          {props.preBodyContent && <div className={`padding-bottom-205`}>{props.preBodyContent}</div>}
          <Content>{props.bodyText}</Content>
          {props.ctaOnClick && props.card.ctaText && (
            <div className="margin-top-205 flex flex-justify-center desktop:flex-justify-end">
              <Button
                style="secondary"
                onClick={props.ctaOnClick}
                noRightMargin
                dataTestid={`cta-${props.card.id}`}
                fullWidth
              >
                {props.card.ctaText}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
