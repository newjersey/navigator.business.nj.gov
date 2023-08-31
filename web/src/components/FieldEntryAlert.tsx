import { Content } from "@/components/Content";
import { Alert, AlertVariant } from "@/components/njwds-extended/Alert";
import { ReactElement, ReactNode } from "react";

interface Props {
  alertMessage: string;
  fields: {
    name: string;
    label: string;
    children?: ReactNode;
  }[];
  testId?: string;
  variant: AlertVariant;
}

export const FieldEntryAlert = (props: Props): ReactElement => {
  if (props.fields.length === 0) return <></>;

  return (
    <Alert variant={props.variant} dataTestid={props.testId}>
      <Content>{props.alertMessage}</Content>
      <ul>
        {props.fields.map((field) => (
          <li key={field.name} data-testid={`question-${field.name}-alert-text`}>
            <a href={`#question-${field.name}`}>{field.label}</a>
            {field.children}
          </li>
        ))}
      </ul>
    </Alert>
  );
};
