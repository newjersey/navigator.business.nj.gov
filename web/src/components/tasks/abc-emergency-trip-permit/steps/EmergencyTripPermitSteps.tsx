import { BillingStep } from "@/components/tasks/abc-emergency-trip-permit/steps/BillingStep";
import { EmergencyTripPermitStepsConfiguration } from "@/components/tasks/abc-emergency-trip-permit/steps/EmergencyTripPermitStepsConfiguration";
import { InstructionsStep } from "@/components/tasks/abc-emergency-trip-permit/steps/InstructionsStep";
import { RequestorStep } from "@/components/tasks/abc-emergency-trip-permit/steps/RequestorStep";
import { ReviewStep } from "@/components/tasks/abc-emergency-trip-permit/steps/ReviewStep";
import { TripStep } from "@/components/tasks/abc-emergency-trip-permit/steps/TripStep";
import { EmergencyTripPermitStepNames } from "@businessnjgovnavigator/shared/types";
import { ReactElement } from "react";

export const EmergencyTripPermitSteps: {
  component: ReactElement;
  step: EmergencyTripPermitStepNames;
}[] = [
  {
    component: <InstructionsStep />,
    step: EmergencyTripPermitStepsConfiguration[0].name,
  },
  {
    component: <RequestorStep />,
    step: EmergencyTripPermitStepsConfiguration[1].name,
  },
  {
    component: <TripStep />,
    step: EmergencyTripPermitStepsConfiguration[2].name,
  },
  {
    component: <BillingStep />,
    step: EmergencyTripPermitStepsConfiguration[3].name,
  },
  {
    component: <ReviewStep />,
    step: EmergencyTripPermitStepsConfiguration[4].name,
  },
];
