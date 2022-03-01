import { businessFormationTabsNames } from "@/lib/types/types";
import React, { ReactElement } from "react";
import { BusinessNameSection } from "./BusinessNameSection";
import { BusinessSection } from "./BusinessSection";
import { ContactsSection } from "./ContactsSection";
import { PaymentSection } from "./PaymentSection";
import { ReviewSection } from "./ReviewSection";

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
