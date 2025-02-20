import { Content } from "@/components/Content";
import { EmergencyTripPermitStepsConfiguration } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitStepsConfiguration";
import { InstructionsStep } from "@/components/tasks/abc-emergency-trip-permit/steps/InstructionsStep";
import { RequestorStep } from "@/components/tasks/abc-emergency-trip-permit/steps/RequestorStep";
import { AbcEmergencyTripPermitStepNames } from "@/lib/types/types";
import { ReactElement } from "react";

export const EmergencyTripPermitSteps: { component: ReactElement; step: AbcEmergencyTripPermitStepNames }[] =
  [
    {
      component: <InstructionsStep />,
      step: EmergencyTripPermitStepsConfiguration[0].name,
    },
    {
      component: <RequestorStep />,
      step: EmergencyTripPermitStepsConfiguration[1].name,
    },
    {
      component: <Content>EmergencyTripPermitStepsConfiguration[2].name</Content>,
      step: EmergencyTripPermitStepsConfiguration[2].name,
    },
    {
      component: <Content>EmergencyTripPermitStepsConfiguration[3].name</Content>,
      step: EmergencyTripPermitStepsConfiguration[3].name,
    },
    {
      component: <Content>EmergencyTripPermitStepsConfiguration[4].name</Content>,
      step: EmergencyTripPermitStepsConfiguration[4].name,
    },
  ];
