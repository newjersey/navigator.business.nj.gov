import { BusinessSection } from "@/components/tasks/business-formation/business/BusinessSection";
import { ContactsSection } from "@/components/tasks/business-formation/contacts/ContactsSection";
import { BusinessNameSection } from "@/components/tasks/business-formation/name/BusinessNameSection";
import { PaymentSection } from "@/components/tasks/business-formation/payment/PaymentSection";
import { ReviewSection } from "@/components/tasks/business-formation/review/ReviewSection";
import { ReactElement } from "react";

export const BusinessFormationTabs: { component: ReactElement; section: string; tabIndex: number }[] = [
  {
    component: <BusinessNameSection />,
    section: "Name",
    tabIndex: 0,
  },
  {
    component: <BusinessSection />,
    section: "Business",
    tabIndex: 1,
  },
  {
    component: <ContactsSection />,
    section: "Contacts",
    tabIndex: 2,
  },
  {
    component: <ReviewSection />,
    section: "Review",
    tabIndex: 3,
  },
  {
    component: <PaymentSection />,
    section: "Billing",
    tabIndex: 4,
  },
];

export const LookupTabIndexByName = (name: string): number => {
  return BusinessFormationTabs.find((x) => x.section === name)?.tabIndex ?? -1;
};
