import type { DbaStepNames } from "@businessnjgovnavigator/shared/types";
import type { ReactElement } from "react";
import { DbaFormationStepsConfiguration } from "@/components/tasks/business-formation/DbaFormationStepsConfiguration";
import { Authorization } from "@/components/tasks/business-formation/dba/Authorization";
import { DbaResolution } from "@/components/tasks/business-formation/dba/DbaResolution";
import { NexusSearchBusinessNameStep } from "@/components/tasks/business-formation/name/NexusSearchBusinessNameStep";

export const DbaFormationSteps: { component: ReactElement; step: DbaStepNames }[] = [
  {
    component: <NexusSearchBusinessNameStep />,
    step: DbaFormationStepsConfiguration[0].name,
  },
  {
    component: <DbaResolution />,
    step: DbaFormationStepsConfiguration[1].name,
  },
  {
    component: <Authorization />,
    step: DbaFormationStepsConfiguration[2].name,
  },
];
