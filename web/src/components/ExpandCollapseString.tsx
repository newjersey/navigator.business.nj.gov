import { ReactElement } from "react";
import ClampLines from "react-clamp-lines";

interface Props {
  text: string;
  dataTestId?: string;
  viewMoreText: string;
  viewLessText: string;
  lines: number;
}

export const ExpandCollapseString = (props: Props): ReactElement<any> => {
  return (
    <div {...(props.dataTestId ? { "data-testid": props.dataTestId } : {})}>
      <ClampLines
        text={props.text}
        id={Math.random().toString().slice(2)}
        lines={props.lines}
        ellipsis="..."
        moreText={props.viewMoreText}
        lessText={props.viewLessText}
        className="lines-ellipsis"
        innerElement="p"
      />
    </div>
  );
};
