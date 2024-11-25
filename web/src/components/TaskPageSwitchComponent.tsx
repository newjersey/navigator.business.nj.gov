import { TaskBody } from "@/components/TaskBody";
import { EinTask } from "@/components/tasks/EinTask";
import { ElevatorRegistrationTask } from "@/components/tasks/ElevatorRegistrationTask";
import { HotelMotelRegistrationTask } from "@/components/tasks/HotelMotelRegistrationTask";
import { LicenseTask } from "@/components/tasks/LicenseTask";
import { MultipleDwellingRegistrationTask } from "@/components/tasks/MultipleDwellingRegistrationTask";
import { NaicsCodeTask } from "@/components/tasks/NaicsCodeTask";
import { RaffleBingoPaginator } from "@/components/tasks/RaffleBingoPaginator";
import { TaxTask } from "@/components/tasks/TaxTask";
import { BusinessFormation } from "@/components/tasks/business-formation/BusinessFormation";
import { BusinessStructureTask } from "@/components/tasks/business-structure/BusinessStructureTask";
import { CannabisApplyForLicenseTask } from "@/components/tasks/cannabis/CannabisApplyForLicenseTask";
import { CannabisPriorityStatusTask } from "@/components/tasks/cannabis/CannabisPriorityStatusTask";
import { Roadmap, Task, TasksDisplayContent, TaskWithLicenseTaskId } from "@/lib/types/types";
import { rswitch } from "@/lib/utils/helpers";
import { getTaskFromRoadmap } from "@/lib/utils/roadmap-helpers";
import { formationTaskId } from "@businessnjgovnavigator/shared/domain-logic/taskIds";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { ReactElement } from "react";

interface Props {
  task: Task | TaskWithLicenseTaskId;
  displayContent: TasksDisplayContent;
  business: Business;
  roadmap: Roadmap;
  CMS_ONLY_disable_overlay?: boolean;
}

export const taskIdsWithLicenseSearchEnabled = [
  "apply-for-shop-license",
  "appraiser-company-register",
  "authorization-architect-firm",
  "authorization-landscape-architect-firm",
  "cemetery-certificate",
  "consulting-firm-headhunter-reg",
  "electrologist-office-license",
  "entertainment-agency-reg",
  "health-club-registration",
  "home-health-aide-license",
  "license-massage-therapy",
  "pharmacy-license",
  "register-accounting-firm",
  "register-home-contractor",
  "search-licenses-employment-agency",
  "telemarketing-license",
  "ticket-broker-reseller-registration",
  "temp-help-consulting-firm-combined-reg",
  "temporary-help-service-firm-reg",
];

export const TaskPageSwitchComponent = ({
  task,
  displayContent,
  business,
  roadmap,
  CMS_ONLY_disable_overlay,
}: Props): ReactElement => {
  if (taskIdsWithLicenseSearchEnabled.includes(task.id)) {
    return (
      <LicenseTask task={task as TaskWithLicenseTaskId} CMS_ONLY_disable_overlay={CMS_ONLY_disable_overlay} />
    );
  }

  return rswitch(task.id, {
    "elevator-registration": (
      <ElevatorRegistrationTask task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_overlay} />
    ),
    "hotel-motel-registration": (
      <HotelMotelRegistrationTask task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_overlay} />
    ),
    "multiple-dwelling-registration": (
      <MultipleDwellingRegistrationTask task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_overlay} />
    ),
    "raffle-bingo-games-license": <RaffleBingoPaginator task={task} />,
    "determine-naics-code": <NaicsCodeTask task={task} />,
    "priority-status-cannabis": <CannabisPriorityStatusTask task={task} />,
    "conditional-permit-cannabis": <CannabisApplyForLicenseTask task={task} />,
    "annual-license-cannabis": <CannabisApplyForLicenseTask task={task} />,
    "register-for-ein": <EinTask task={task} />,
    "register-for-taxes": <TaxTask task={getTaskFromRoadmap(roadmap, task.id) ?? task} />,
    "business-structure": <BusinessStructureTask task={getTaskFromRoadmap(roadmap, task.id) ?? task} />,
    "search-business-name": (
      <BusinessFormation task={getTaskFromRoadmap(roadmap, task.id)} displayContent={displayContent} />
    ),
    [formationTaskId]: (
      <BusinessFormation task={getTaskFromRoadmap(roadmap, task.id)} displayContent={displayContent} />
    ),
    default: <TaskBody task={task} business={business} roadmap={roadmap} />,
  });
};
