import { Alert } from "@/components/njwds-extended/Alert";
import { Button } from "@/components/njwds-extended/Button";
import { PureMarkdownContent } from "@/components/PureMarkdownContent";
import { DbaNameSearch } from "@/components/tasks/business-formation/name/DbaNameSearch";
import { UnavailableProps } from "@/components/tasks/search-business-name/UnavailableProps";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { templateEval } from "@/lib/utils/helpers";
import { ReactElement } from "react";

export const NexusUnavailable = (props: UnavailableProps): ReactElement => {
  const { Config } = useConfig();

  const onClick = () => {
    analytics.event.business_formation_search_existing_name_again.click.refresh_name_search_field();
    props.resetSearch();
  };
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
          <Button style="tertiary" onClick={onClick} className="display-inline" dataTestid="search-again">
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
