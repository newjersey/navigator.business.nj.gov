import { Alert } from "@/components/njwds-extended/Alert";
import { UnavailableProps } from "@/components/tasks/search-business-name/UnavailableProps";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { templateEval } from "@/lib/utils/helpers";
import { ReactElement } from "react";

export const BusinessNameUnavailable = (props: UnavailableProps): ReactElement => {
  const { Config } = useConfig();

  return (
    <Alert variant="error" dataTestid="unavailable-text">
      <p className="font-sans-xs">
        {templateEval(Config.formation.fields.businessName.alertUnavailable, {
          name: props.submittedName,
        })}
      </p>
      {props.nameAvailability.similarNames.length > 0 && (
        <>
          <p className="font-sans-xs margin-bottom-1">
            {Config.searchBusinessNameTask.similarUnavailableNamesText}
          </p>
          <ul className="usa-list">
            {props.nameAvailability.similarNames.map((otherName) => {
              return (
                <li className="text-uppercase text-bold margin-y-0 font-sans-xs" key={otherName}>
                  {otherName}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Alert>
  );
};
