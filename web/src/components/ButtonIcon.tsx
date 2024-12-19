import { ReactElement } from "react";

interface Props {
  svgFilename: string;
  sizePx?: string;
}

export const ButtonIcon = (props: Props): ReactElement<any> => {
  const sizePx = props.sizePx ?? "20px";

  return (
    <img
      className="margin-right-05 margin-left-neg-1"
      width={sizePx}
      height={sizePx}
      src={`/img/${props.svgFilename}.svg`}
      alt=""
    />
  );
};
