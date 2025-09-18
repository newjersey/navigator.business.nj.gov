import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { Heading } from "@/components/njwds-extended/Heading";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ReactElement } from "react";

interface Props {
  taskId: string;
  CMS_ONLY_radioSelection?: boolean;
}

export const ManageBusinessVehicleResults = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { business, updateQueue } = useUserData();

  const radioSelection =
    props.CMS_ONLY_radioSelection || business?.roadmapTaskData?.manageBusinessVehicles;

  const handleClick = (): void => {
    updateQueue?.queueTaskProgress({ [props.taskId]: "TO_DO" });
    updateQueue?.queueRoadmapTaskData({ manageBusinessVehicles: undefined });
    updateQueue?.update();
  };

  return (
    <div>
      <Heading level={2}>{Config.manageBusinessVehicles.resultsScreenHeaderText}</Heading>
      <Alert variant="success">
        {Config.manageBusinessVehicles.successAlertText}{" "}
        <UnStyledButton onClick={handleClick} isUnderline>
          {Config.manageBusinessVehicles.successAlertButtonText}
        </UnStyledButton>
      </Alert>

      {radioSelection ? (
        <div data-testid="yesResponseText">
          <Content>{Config.manageBusinessVehicles.yesResponseText}</Content>
        </div>
      ) : (
        <div data-testid="noResponseText">
          <Content>{Config.manageBusinessVehicles.noResponseText}</Content>
        </div>
      )}
    </div>
  );
};
