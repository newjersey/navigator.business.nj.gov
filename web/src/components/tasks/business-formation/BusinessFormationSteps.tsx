import { BillingStep } from "@/components/tasks/business-formation/billing/BillingStep";
import { BusinessStep } from "@/components/tasks/business-formation/business/BusinessStep";
import { BusinessFormationStepsConfiguration } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { ContactsStep } from "@/components/tasks/business-formation/contacts/ContactsStep";
import { ReviewStep } from "@/components/tasks/business-formation/review/ReviewStep";
import { FormationStepNames } from "@businessnjgovnavigator/shared/types";
import { ReactElement } from "react";

export const BusinessFormationSteps: { component: ReactElement; step: FormationStepNames }[] = [
  {
    component: <BusinessStep />,
    step: BusinessFormationStepsConfiguration[0].name,
  },
  {
    component: <ContactsStep />,
    step: BusinessFormationStepsConfiguration[1].name,
  },
  { component: <BillingStep />, step: BusinessFormationStepsConfiguration[2].name },
  { component: <ReviewStep />, step: BusinessFormationStepsConfiguration[3].name },
];
