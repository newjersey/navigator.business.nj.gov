import { AnytimeActionSearch } from "@/components/dashboard/AnytimeActionSearch";
import { HorizontalLine } from "@/components/HorizontalLine";
import { Heading } from "@/components/njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";
import {
  AnytimeActionLicenseReinstatement,
  AnytimeActionTask,
} from "@businessnjgovnavigator/shared/types";
import { ReactElement } from "react";

interface Props {
  commonBusinessTasks: (AnytimeActionLicenseReinstatement | AnytimeActionTask)[];
  anytimeActionTasks: AnytimeActionTask[];
  anytimeActionTasksFromNonEssentialQuestions: AnytimeActionTask[];
  anytimeActionLicenseReinstatements: AnytimeActionLicenseReinstatement[];
}

export const AnytimeActionContainer = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <div className={"anytime-action-dropdown-container"}>
      <Heading level={2}>{Config.dashboardAnytimeActionDefaults.defaultHeaderText}</Heading>
      <HorizontalLine ariaHidden={true} />
      <Heading level={3}>{Config.dashboardAnytimeActionDefaults.searchFieldHeaderText}</Heading>
      <AnytimeActionSearch
        anytimeActionTasks={props.anytimeActionTasks}
        anytimeActionTasksFromNonEssentialQuestions={
          props.anytimeActionTasksFromNonEssentialQuestions
        }
        anytimeActionLicenseReinstatements={props.anytimeActionLicenseReinstatements}
      />
      {props.commonBusinessTasks.length > 0 && (
        <>
          <Heading level={3}>
            {Config.dashboardAnytimeActionDefaults.commonBusinessTasksHeader}
          </Heading>
          <ul>
            {props.commonBusinessTasks.map((businessTask) => (
              <li key={businessTask.urlSlug}>{businessTask.name}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
