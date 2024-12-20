import { BillingStep } from "@/components/tasks/business-formation/billing/BillingStep";
import { BusinessStep } from "@/components/tasks/business-formation/business/BusinessStep";
import { BusinessFormationStepsConfiguration } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { ContactsStep } from "@/components/tasks/business-formation/contacts/ContactsStep";
import { BusinessNameStep } from "@/components/tasks/business-formation/name/BusinessNameStep";
import { ReviewStep } from "@/components/tasks/business-formation/review/ReviewStep";
import { FormationStepNames } from "@/lib/types/types";
import { ReactElement } from "react";

export const BusinessFormationSteps: { component: ReactElement<any>; step: FormationStepNames }[] = [
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
