import { BusinessSection } from "@/components/tasks/business-formation/business/BusinessSection";
import { ContactsSection } from "@/components/tasks/business-formation/contacts/ContactsSection";
import { BusinessNameSection } from "@/components/tasks/business-formation/name/BusinessNameSection";
import { PaymentSection } from "@/components/tasks/business-formation/payment/PaymentSection";
import { ReviewSection } from "@/components/tasks/business-formation/review/ReviewSection";
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
