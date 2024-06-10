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
import { Roadmap, Task, TasksDisplayContent } from "@/lib/types/types";
import { rswitch } from "@/lib/utils/helpers";
import { getTaskFromRoadmap } from "@/lib/utils/roadmap-helpers";
import { formationTaskId } from "@businessnjgovnavigator/shared/domain-logic/taskIds";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { ReactElement } from "react";

interface Props {
  task: Task;
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
  return rswitch(task.id, {
    "home-health-aide-license": (
      <LicenseTask task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_overlay} />
    ),
    "apply-for-shop-license": <LicenseTask task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_overlay} />,
    "register-consumer-affairs": (
      <LicenseTask task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_overlay} />
    ),
    "pharmacy-license": <LicenseTask task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_overlay} />,
    "register-accounting-firm": (
      <LicenseTask task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_overlay} />
    ),
    "public-accountant-license": (
      <LicenseTask task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_overlay} />
    ),
    "license-massage-therapy": (
      <LicenseTask task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_overlay} />
    ),
    "moving-company-license": <LicenseTask task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_overlay} />,
    "architect-license": <LicenseTask task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_overlay} />,
    "hvac-license": <LicenseTask task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_overlay} />,
    "appraiser-license": <LicenseTask task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_overlay} />,
    "telemarketing-license": <LicenseTask task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_overlay} />,
    "landscape-architect-license": (
      <LicenseTask task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_overlay} />
    ),
    "health-club-registration": (
      <LicenseTask task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_overlay} />
    ),
    "ticket-broker-reseller-registration": (
      <LicenseTask task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_overlay} />
    ),
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
