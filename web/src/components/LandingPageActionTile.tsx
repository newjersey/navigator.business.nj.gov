import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  imgPath: string;
  tileText: string;
  tileText2?: string;
  isPrimary?: boolean;
  dataTestId: string;
  onClick: () => void;
}

const setTileText = (props: Props, isMobile: boolean) => {
  if (isMobile && props.isPrimary) {
    return (
      <div>
        {props.tileText} {props.tileText2}
      </div>
    );
  } else if (props.isPrimary) {
    return (
      <div>
        {props.tileText} <br /> {props.tileText2}
      </div>
    );
  } else {
    return <div>{props.tileText}</div>;
  }
};

export const LandingPageActionTile = (props: Props): ReactElement => {
  const isMobile = useMediaQuery(MediaQueries.isMobile);

  return (
    <button
      className={`${props.isPrimary ? "landing-page-tile" : "landing-page-secondary-tile"} margin-1 ${
        isMobile ? "tal" : ""
      }`}
      data-testid={props.dataTestId}
      onClick={props.onClick}
    >
      <img src={props.imgPath} alt="" />
      {setTileText(props, isMobile)}
    </button>
  );
};
