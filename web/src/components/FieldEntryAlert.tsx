import { Content } from "@/components/Content";
import { Alert, AlertProps } from "@/components/njwds-extended/Alert";
import { useRouter } from "next/compat/router";
import { ReactElement, ReactNode } from "react";

interface Props {
  alertMessage: string;
  alertProps: AlertProps;
  fields: {
    name: string;
    label: string;
    children?: ReactNode;
  }[];
}

export const FieldEntryAlert = (props: Props): ReactElement => {
  const router = useRouter();

  const onAnchorClick = (): void => {
    setTimeout(() => {
      router && router.push(router.asPath, undefined, { shallow: true });
    });
  };

  if (props.fields.length === 0) return <></>;

  return (
    <Alert {...props.alertProps}>
      <Content>{props.alertMessage}</Content>
      <ul>
        {props.fields.map((field) => (
          <li key={field.name} data-testid={`question-${field.name}-alert-text`}>
            <a href={`#question-${field.name}`} onClick={(): void => onAnchorClick()}>
              {field.label}
            </a>
            {field.children}
          </li>
        ))}
      </ul>
    </Alert>
  );
};
