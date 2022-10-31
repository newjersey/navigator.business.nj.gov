import { UnavailableProps } from "@/components/tasks/search-business-name/UnavailableProps";
import { templateEval } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement } from "react";

export const Unavailable = (props: UnavailableProps): ReactElement => {
  return (
    <div data-testid="unavailable-text">
      <p className="font-body-2xs text-red">
        {templateEval(Config.searchBusinessNameTask.unavailableText, { name: props.submittedName })}
      </p>
      <p className="font-body-2xs text-red margin-bottom-1">
        {Config.searchBusinessNameTask.similarUnavailableNamesText}
      </p>
      <ul className="usa-list--unstyled font-body-2xs text-red">
        {props.nameAvailability &&
          props.nameAvailability.similarNames.map((otherName) => {
            return (
              <li className="text-uppercase text-bold margin-top-0" key={otherName}>
                {otherName}
              </li>
            );
          })}
      </ul>
    </div>
  );
};
