import { businessFormationTabsNames } from "@/lib/types/types";
import React, { ReactElement } from "react";
import { BusinessSection } from "./BusinessSection";
import { ContactsSection } from "./ContactsSection";
import { PaymentSection } from "./PaymentSection";
import { ReviewSection } from "./ReviewSection";

export const businessFormationTabs: { component: ReactElement; section: businessFormationTabsNames }[] = [
  {
    component: <BusinessSection />,
    section: "Main Business",
  },
  {
    component: <ContactsSection />,
    section: "Contacts",
  },
  { component: <ReviewSection />, section: "Review" },
  { component: <PaymentSection />, section: "Payment" },
];
