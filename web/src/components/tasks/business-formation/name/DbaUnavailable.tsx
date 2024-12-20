import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { UnavailableProps } from "@/components/tasks/search-business-name/UnavailableProps";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { templateEval } from "@/lib/utils/helpers";
import { ReactElement } from "react";

export const DbaUnavailable = (props: UnavailableProps): ReactElement<any> => {
  const { Config } = useConfig();
  return (
    <div data-testid="unavailable-text" className="margin-bottom-2">
      <Alert variant="error">
        <Content>
          {templateEval(Config.nexusNameSearch.dbaUnavailableText, { name: props.submittedName })}
        </Content>
        <ul className="font-body-2xs">
          {props.nameAvailability &&
            props.nameAvailability.similarNames.map((otherName) => {
              return (
                <li className="text-uppercase text-bold margin-top-0" key={otherName}>
                  {otherName}
                </li>
              );
            })}
        </ul>
      </Alert>
    </div>
  );
};
