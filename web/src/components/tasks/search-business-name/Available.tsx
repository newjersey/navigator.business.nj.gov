import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { AvailableProps } from "@/components/tasks/search-business-name/AvailableProps";
import { templateEval } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement } from "react";

export const Available = (props: AvailableProps): ReactElement => {
  return (
    <div data-testid="available-text">
      <p className="font-body-2xs text-primary">
        {templateEval(Config.searchBusinessNameTask.availableText, { name: props.submittedName })}
      </p>
      {props.updateButtonClicked ? (
        <div className="font-body-2xs text-primary margin-top-05" data-testid="name-has-been-updated">
          <span className="padding-right-05">
            <Icon>check</Icon>
          </span>
          <span>{Config.searchBusinessNameTask.nameHasBeenUpdatedText}</span>
        </div>
      ) : (
        <>
          <UnStyledButton
            style="tertiary"
            underline
            smallText
            onClick={props.updateNameOnProfile}
            dataTestid="update-name"
          >
            <span className="">{Config.searchBusinessNameTask.updateButtonText}</span>
          </UnStyledButton>
        </>
      )}
    </div>
  );
};
