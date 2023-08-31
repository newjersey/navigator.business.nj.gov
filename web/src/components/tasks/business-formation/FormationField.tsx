import { ReactElement } from "rehype-react/lib";

interface Props {
  fieldName: string;
}

export const FormationField = (props: React.PropsWithChildren<Props>): ReactElement => {
  return <div id={`question-${props.fieldName}`}>{props.children}</div>;
};
