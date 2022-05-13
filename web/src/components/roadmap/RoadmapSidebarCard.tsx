import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { useRoadmapSidebarCards } from "@/lib/data-hooks/useRoadmapSidebarCards";
import { SidebarCardContent } from "@/lib/types/types";
import React from "react";

type Props = {
  card: SidebarCardContent;
};

export const RoadmapSidebarCard = (props: Props) => {
  const { hideCard } = useRoadmapSidebarCards();

  const closeSelf = async () => {
    await hideCard(props.card.id);
  };

  return (
    <div
      className={`border radius-md border-${props.card.color} box-shadow-${props.card.shadowColor} margin-left-05 margin-bottom-3`}
      {...{ "data-testid": props.card.id }}
    >
      {props.card.header && (
        <div className={`bg-${props.card.shadowColor} padding-y-105 padding-x-205 radius-top-md`}>
          {props.card.hasCloseButton ? (
            <div className="flex flex-justify">
              <h3
                className={`margin-bottom-0 text-${props.card.color} ${
                  props.card.imgPath ? "flex flex-align-end" : ""
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
                <span>{props.card.header}</span>
              </h3>
              <Button style="tertiary" onClick={closeSelf} ariaLabel="Close">
                <Icon className={`font-sans-xl text-${props.card.color}`}>close</Icon>
              </Button>
            </div>
          ) : (
            <h3
              className={`margin-bottom-0 text-${props.card.color} ${
                props.card.imgPath ? "flex flex-align-end" : ""
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
              <span>{props.card.header}</span>
            </h3>
          )}
        </div>
      )}
      <div
        className={`bg-white padding-205 text-base radius-bottom-md ${!props.card.header && "radius-top-md"}`}
      >
        <Content>{props.card.contentMd}</Content>
      </div>
    </div>
  );
};
