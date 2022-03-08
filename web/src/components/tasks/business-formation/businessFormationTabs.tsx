import { BusinessNameSection } from "@/components/tasks/business-formation/BusinessNameSection";
import { BusinessSection } from "@/components/tasks/business-formation/BusinessSection";
import { ContactsSection } from "@/components/tasks/business-formation/ContactsSection";
import { PaymentSection } from "@/components/tasks/business-formation/PaymentSection";
import { ReviewSection } from "@/components/tasks/business-formation/ReviewSection";
import { businessFormationTabsNames } from "@/lib/types/types";
import React, { ReactElement } from "react";

export const businessFormationTabs: { component: ReactElement; section: businessFormationTabsNames }[] = [
  {
    component: <BusinessNameSection />,
    section: "Name",
  },
  {
    component: <BusinessSection />,
    section: "Business",
  },
  {
    component: <ContactsSection />,
    section: "Contacts",
  },
  { component: <ReviewSection />, section: "Review" },
  { component: <PaymentSection />, section: "Billing" },
];
