import { BusinessSection } from "@/components/tasks/business-formation/business/BusinessSection";
import { ContactsSection } from "@/components/tasks/business-formation/contacts/ContactsSection";
import { BusinessNameSection } from "@/components/tasks/business-formation/name/BusinessNameSection";
import { PaymentSection } from "@/components/tasks/business-formation/payment/PaymentSection";
import { ReviewSection } from "@/components/tasks/business-formation/review/ReviewSection";
import React, { ReactElement } from "react";
import { BusinessFormationTabsConfiguration } from "./BusinessFormationTabsConfiguration";

export const BusinessFormationTabs: { component: ReactElement; section: string }[] = [
  {
    component: <BusinessNameSection />,
    section: BusinessFormationTabsConfiguration[0].name,
  },
  {
    component: <BusinessSection />,
    section: BusinessFormationTabsConfiguration[1].name,
  },
  {
    component: <ContactsSection />,
    section: BusinessFormationTabsConfiguration[2].name,
  },
  { component: <ReviewSection />, section: BusinessFormationTabsConfiguration[3].name },
  { component: <PaymentSection />, section: BusinessFormationTabsConfiguration[4].name },
];
