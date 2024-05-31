import { ActionTile } from "@/lib/types/types";
import { ReactElement } from "react";

export const LandingPageActionTile = (props: ActionTile): ReactElement => {
  return (
    <button
      className={"landing-page-secondary-tile usa-button"}
      data-testid={props.dataTestId}
      onClick={props.onClick}
    >
      <img src={props.imgPath} alt="" role="presentation" />
      {props.tileText}
    </button>
  );
};
