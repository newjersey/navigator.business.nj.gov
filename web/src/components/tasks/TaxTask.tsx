import { Content } from "@/components/Content";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskHeader } from "@/components/TaskHeader";
import { TaxInput } from "@/components/tasks/TaxInput";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { ReactElement } from "react";

interface Props {
  task: Task;
}

export const TaxTask = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { userData } = useUserData();

  const preInputContent = props.task.contentMd.split("${taxInputComponent}")[0];
  const postInputContent = props.task.contentMd.split("${taxInputComponent}")[1];

  const hasTradeNameLegalStructure = (): boolean => {
    return LookupLegalStructureById(userData?.profileData.legalStructureId).hasTradeName;
  };

  return (
    <div className="minh-38">
      <TaskHeader task={props.task} />
      <UnlockedBy task={props.task} />
      <Content>{preInputContent}</Content>
      <div className="margin-left-5 margin-top-1">
        <div className="max-width-38rem">
          <Content>{Config.tax.descriptionText}</Content>
        </div>
        {hasTradeNameLegalStructure() && (
          <div data-testid="tax-disclaimer">
            <Content className="margin-top-2">
              {Config.profileDefaults.fields.taxId.default.disclaimerMd}
            </Content>
          </div>
        )}
        <TaxInput task={props.task} />
      </div>
      <Content>{postInputContent}</Content>
      <TaskCTA link={props.task.callToActionLink} text={props.task.callToActionText} />
    </div>
  );
};
