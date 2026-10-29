import type { ReactElement } from "react";
import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import type { AvailableProps } from "@/components/tasks/search-business-name/AvailableProps";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { templateEval } from "@/lib/utils/helpers";

export const NexusAvailable = (props: AvailableProps): ReactElement => {
  const { Config } = useConfig();

  return (
    <div data-testid="available-text" className="margin-bottom-2">
      <Alert variant="success">
        <Content>
          {templateEval(Config.nexusNameSearch.availableText, { name: props.submittedName })}
        </Content>
      </Alert>
    </div>
  );
};
