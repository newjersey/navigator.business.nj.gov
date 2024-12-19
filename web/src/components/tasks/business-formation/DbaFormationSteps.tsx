import { Authorization } from "@/components/tasks/business-formation/dba/Authorization";
import { DbaResolution } from "@/components/tasks/business-formation/dba/DbaResolution";
import { DbaFormationStepsConfiguration } from "@/components/tasks/business-formation/DbaFormationStepsConfiguration";
import { NexusSearchBusinessNameStep } from "@/components/tasks/business-formation/name/NexusSearchBusinessNameStep";
import { DbaStepNames } from "@/lib/types/types";
import { ReactElement } from "react";

export const DbaFormationSteps: { component: ReactElement<any>; step: DbaStepNames }[] = [
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
