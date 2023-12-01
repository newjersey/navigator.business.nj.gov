import { ReactElement } from "react";

interface Props {
  fieldName: string;
}

export const FormationField = (props: React.PropsWithChildren<Props>): ReactElement => {
  return (
    <div id={`question-${props.fieldName}`} className="add-spacing-on-ele-scroll">
      {props.children}
    </div>
  );
};
