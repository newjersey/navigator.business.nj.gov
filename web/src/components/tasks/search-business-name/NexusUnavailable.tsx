import { Alert } from "@/components/njwds-extended/Alert";
import { Button } from "@/components/njwds-extended/Button";
import { PureMarkdownContent } from "@/components/PureMarkdownContent";
import { DbaNameSearch } from "@/components/tasks/search-business-name/DbaNameSearch";
import { UnavailableProps } from "@/components/tasks/search-business-name/UnavailableProps";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { templateEval } from "@/lib/utils/helpers";
import { ReactElement } from "react";

export const NexusUnavailable = (props: UnavailableProps): ReactElement => {
  const { Config } = useConfig();

  const [textBeforeButton, textAfterButton] = templateEval(Config.nexusNameSearch.unavailableText, {
    name: props.submittedName,
  }).split("${searchAgainButton}");

  const inlineParagraphComponent = {
    p: (props: { children: string[] }) => {
      return <div className="display-inline">{props.children}</div>;
    },
  };

  return (
    <>
      <div data-testid="unavailable-text">
        <Alert variant="error">
          <PureMarkdownContent components={inlineParagraphComponent}>{textBeforeButton}</PureMarkdownContent>{" "}
          <Button style="tertiary" onClick={props.resetSearch} className="display-inline">
            {Config.nexusNameSearch.searchAgainButtonText}
          </Button>
          <PureMarkdownContent components={inlineParagraphComponent}>{textAfterButton}</PureMarkdownContent>
        </Alert>
      </div>

      <hr className="margin-y-3" />
      <DbaNameSearch />
    </>
  );
};
