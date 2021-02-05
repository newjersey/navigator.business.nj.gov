import { parseISO, format } from "date-fns";
import { ReactElement } from "react";

interface Props {
  dateString: string;
}

export const Date = ({ dateString }: Props): ReactElement => {
  const date = parseISO(dateString);
  return <time dateTime={dateString}>{format(date, "LLLL d, yyyy")}</time>;
};
