import { Content } from "@/components/Content";
import { NeedsAccountMiniCallout } from "@/components/NeedsAccountMiniCallout";
import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { TaskHeader } from "@/components/TaskHeader";
import { TaxInput } from "@/components/tasks/TaxInput";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { TaxDisclaimer } from "@/components/TaxDisclaimer";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@businessnjgovnavigator/shared/types";
import { ReactElement, useContext } from "react";

interface Props {
  task: Task;
}

export const TaxTask = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { business } = useUserData();
  const { isAuthenticated } = useContext(NeedsAccountContext);
  const preInputContent = props.task.contentMd.split("${taxInputComponent}")[0];
  const postInputContent = props.task.contentMd.split("${taxInputComponent}")[1];

  return (
    <div className="min-height-38rem">
      <TaskHeader task={props.task} />
      <NeedsAccountMiniCallout />
      {isAuthenticated === IsAuthenticated.TRUE && <UnlockedBy task={props.task} />}
      <Content>{preInputContent}</Content>
      <div className="margin-left-3ch margin-top-1">
        <Content>{Config.taxId.descriptionText}</Content>
        <TaxDisclaimer legalStructureId={business?.profileData.legalStructureId} />
        <TaxInput task={props.task} />
      </div>
      <Content>{postInputContent}</Content>
      {props.task.callToActionLink && props.task.callToActionText && (
        <SingleCtaLink link={props.task.callToActionLink} text={props.task.callToActionText} />
      )}
    </div>
  );
};
