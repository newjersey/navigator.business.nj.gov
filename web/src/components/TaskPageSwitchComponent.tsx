import { TaskBody } from "@/components/TaskBody";
import { EinTask } from "@/components/tasks/EinTask";
import { ElevatorRegistrationTask } from "@/components/tasks/ElevatorRegistrationTask";
import { HotelMotelRegistrationTask } from "@/components/tasks/HotelMotelRegistrationTask";
import { LicenseTask } from "@/components/tasks/LicenseTask";
import { NaicsCodeTask } from "@/components/tasks/NaicsCodeTask";
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

export const TaskPageSwitchComponent = ({
  task,
  displayContent,
  business,
  roadmap,
  CMS_ONLY_disable_overlay,
}: Props): ReactElement => {
  const taskIdsWithLicenseSearchEnabled = [
    "home-health-aide-license",
    "apply-for-shop-license",
    "register-home-contractor",
    "pharmacy-license",
    "register-accounting-firm",
    "license-massage-therapy",
    "appraiser-company-register",
    "telemarketing-license",
    "health-club-registration",
    "ticket-broker-reseller-registration",
    "authorization-landscape-architect-firm",
    "authorization-architect-firm",
  ];

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
