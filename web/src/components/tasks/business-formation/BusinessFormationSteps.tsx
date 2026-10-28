import type { FormationStepNames } from "@businessnjgovnavigator/shared/types";
import type { ReactElement } from "react";
import { BusinessFormationStepsConfiguration } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { BillingStep } from "@/components/tasks/business-formation/billing/BillingStep";
import { BusinessStep } from "@/components/tasks/business-formation/business/BusinessStep";
import { ContactsStep } from "@/components/tasks/business-formation/contacts/ContactsStep";
import { BusinessNameStep } from "@/components/tasks/business-formation/name/BusinessNameStep";
import { ReviewStep } from "@/components/tasks/business-formation/review/ReviewStep";

export const BusinessFormationSteps: { component: ReactElement; step: FormationStepNames }[] = [
  {
    component: <BusinessNameStep />,
    step: BusinessFormationStepsConfiguration[0].name,
  },
  {
    component: <BusinessStep />,
    step: BusinessFormationStepsConfiguration[1].name,
  },
  {
    component: <ContactsStep />,
    step: BusinessFormationStepsConfiguration[2].name,
  },
  { component: <BillingStep />, step: BusinessFormationStepsConfiguration[3].name },
  { component: <ReviewStep />, step: BusinessFormationStepsConfiguration[4].name },
];
