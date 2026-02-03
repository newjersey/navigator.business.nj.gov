import { CrtkPage } from "@/components/crtk/CrtkPage";
import { TaskBody } from "@/components/TaskBody";
import { TaskHeader } from "@/components/TaskHeader";
import { GovernmentContractingElement } from "@/components/tasks/anytime-action/government-contracting/GovernmentContractingElement";
import { BusinessFormation } from "@/components/tasks/business-formation/BusinessFormation";
import { BusinessStructureTask } from "@/components/tasks/business-structure/BusinessStructureTask";
import { CannabisApplyForLicenseTask } from "@/components/tasks/cannabis/CannabisApplyForLicenseTask";
import { CannabisPriorityStatusTask } from "@/components/tasks/cannabis/CannabisPriorityStatusTask";
import { CigaretteLicense } from "@/components/tasks/cigarette-license/CigaretteLicense";
import { EinTask } from "@/components/tasks/EinTask";
import { ElevatorRegistrationTask } from "@/components/tasks/ElevatorRegistrationTask";
import { EnvPermit } from "@/components/tasks/environment-questionnaire/EnvPermit";
import { HotelMotelRegistrationTask } from "@/components/tasks/HotelMotelRegistrationTask";
import { LicenseTask } from "@/components/tasks/LicenseTask";
import { ManageBusinessVehicles } from "@/components/tasks/manage-business-vehicles/ManageBusinessVehicles";
import { MultipleDwellingRegistrationTask } from "@/components/tasks/MultipleDwellingRegistrationTask";
import { NaicsCodeTask } from "@/components/tasks/NaicsCodeTask";
import { PassengerTransportCdl } from "@/components/tasks/passenger-transport-cdl/PassengerTransportCdl";
import { RaffleBingoPaginator } from "@/components/tasks/RaffleBingoPaginator";
import { TaxTask } from "@/components/tasks/TaxTask";
import { Xray } from "@/components/xray/Xray";
import { rswitch } from "@/lib/utils/helpers";
import { getTaskFromRoadmap } from "@/lib/utils/roadmap-helpers";
import { formationTaskId } from "@businessnjgovnavigator/shared/domain-logic/taskIds";
import {
  FormationDbaDisplayContent,
  Roadmap,
  Task,
  TaskWithLicenseTaskId,
} from "@businessnjgovnavigator/shared/types";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { ReactElement } from "react";

interface Props {
  task: Task | TaskWithLicenseTaskId;
  displayContent: FormationDbaDisplayContent;
  business: Business;
  roadmap: Roadmap;
  CMS_ONLY_disable_default_functionality?: boolean;
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
  "funeral-registration",
  "health-club-registration",
  "home-health-aide-license",
  "license-massage-therapy",
  "moving-company-license",
  "oos-pharmacy-registration",
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
  CMS_ONLY_disable_default_functionality,
}: Props): ReactElement => {
  if (taskIdsWithLicenseSearchEnabled.includes(task.id)) {
    return (
      <LicenseTask
        task={task as TaskWithLicenseTaskId}
        CMS_ONLY_disable_overlay={CMS_ONLY_disable_default_functionality}
      />
    );
  }

  const isCigaretteLicenseEnabled = process.env.FEATURE_CIGARETTE_LICENSE === "true";

  return rswitch(task.id, {
    pwcr: <GovernmentContractingElement headerOverride={<TaskHeader task={task} />} />,
    "env-permitting": <EnvPermit task={task} />,
    "waste-permitting": <EnvPermit task={task} />,
    "land-permitting": <EnvPermit task={task} />,
    "air-permitting": <EnvPermit task={task} />,
    "passenger-transport-cdl": <PassengerTransportCdl task={task} />,
    "cigarette-license":
      isCigaretteLicenseEnabled && !CMS_ONLY_disable_default_functionality ? (
        <CigaretteLicense task={task} />
      ) : (
        <TaskBody task={task} business={business} roadmap={roadmap} />
      ),
    "xray-reg": (
      <Xray task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_default_functionality} />
    ),
    "elevator-registration": (
      <ElevatorRegistrationTask
        task={task}
        CMS_ONLY_disable_overlay={CMS_ONLY_disable_default_functionality}
      />
    ),
    "manage-business-vehicles": <ManageBusinessVehicles task={task} />,
    "hotel-motel-registration": (
      <HotelMotelRegistrationTask
        task={task}
        CMS_ONLY_disable_overlay={CMS_ONLY_disable_default_functionality}
      />
    ),
    "multiple-dwelling-registration": (
      <MultipleDwellingRegistrationTask
        task={task}
        CMS_ONLY_disable_overlay={CMS_ONLY_disable_default_functionality}
      />
    ),
    "raffle-bingo-games-license": <RaffleBingoPaginator task={task} />,
    "determine-naics-code": <NaicsCodeTask task={task} />,
    "priority-status-cannabis": <CannabisPriorityStatusTask task={task} />,
    "conditional-permit-cannabis": <CannabisApplyForLicenseTask task={task} />,
    "annual-license-cannabis": <CannabisApplyForLicenseTask task={task} />,
    "register-for-ein": <EinTask task={task} />,
    "register-for-taxes": <TaxTask task={getTaskFromRoadmap(roadmap, task.id) ?? task} />,
    "business-structure": (
      <BusinessStructureTask task={getTaskFromRoadmap(roadmap, task.id) ?? task} />
    ),
    [formationTaskId]: (
      <BusinessFormation
        task={getTaskFromRoadmap(roadmap, task.id)}
        displayContent={displayContent}
      />
    ),
    "community-right-to-know-survey": (
      <CrtkPage task={task} CMS_ONLY_disable_overlay={CMS_ONLY_disable_default_functionality} />
    ),
    default: <TaskBody task={task} business={business} roadmap={roadmap} />,
  });
};
