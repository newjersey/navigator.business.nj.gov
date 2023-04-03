import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { MutableRefObject, ReactElement, ReactNode } from "react";

interface Props {
  className: string;
  imgPath: string;
  tileText: string;
  tileText2?: string;
  isPrimary?: boolean;
  isActive?: boolean;
  dataTestId: string;
  reference?: MutableRefObject<null | HTMLDivElement>;
  onClick: () => void;
}

const setTileText = (props: Props, isMobile: boolean): ReactNode => {
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
    <div className={props.className} ref={props.reference}>
      <button
        className={`${props.isPrimary ? "landing-page-tile" : "landing-page-secondary-tile"} margin-1`}
        data-testid={props.dataTestId}
        onClick={props.onClick}
        tabIndex={props.isActive ? undefined : -1}
      >
        <img src={props.imgPath} alt="" />
        {setTileText(props, isMobile)}
      </button>
    </div>
  );
};
