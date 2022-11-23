import { ReactElement } from "react";

interface Props {
  imgPath: string;
  tileText: string;
  isPrimary?: boolean;
  dataTestId: string;
  onClick: () => void;
}

export const LandingPageActionTile = (props: Props): ReactElement => {
  return (
    <button
      className={`${props.isPrimary ? "landing-page-tile" : "landing-page-secondary-tile"} margin-1`}
      data-testid={props.dataTestId}
      onClick={props.onClick}
    >
      <img src={props.imgPath} alt="" />
      {props.tileText}
    </button>
  );
};
