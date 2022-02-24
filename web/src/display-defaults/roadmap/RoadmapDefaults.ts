import { SectionType } from "@/lib/types/types";

export const RoadmapDefaults: Record<string, string> = {
  greyBoxBusinessNameText: "Business Name",
  greyBoxIndustryText: "Industry",
  greyBoxLegalStructureText: "Legal Structure",
  greyBoxMunicipalityText: "Location",
  greyBoxEINText: "Employer Identification Number (EIN)",
  greyBoxEntityIdText: "Entity ID",
  greyBoxTaxIdText: "NJ Tax ID",
  greyBoxNotesText: "Notes",
  greyBoxEditText: "View/Edit Profile",
  greyBoxHeaderText: "Business Profile",
  greyBoxNotSetText: "Not set",
  greyBoxNotEnteredText: "Not entered",
  greyBoxViewMoreText: "View More",
  greyBoxViewLessText: "View Less",
  roadmapTitleNotSet: "Your Business Roadmap",
  roadmapTitleTemplate: "Business Roadmap for ${businessName}",
  loadingText: "Loading...",
  calendarFilingDueDateLabel: "Due",
  congratulatorModalTitle: "You did it!",
  congratulatorModalHeader: "You reached a crucial milestone as a business.",
  congratulatorModalBody: "You can now start your",
  congratulatorModalLinkText: "tasks.",
  graduationHeader: "I have formed and registered my business, what’s next?",
  graduationBodyText: "Learn about annual filings, certifications, funding opportunities, and more.",
  graduationButtonText: "Continue",
};

export const SectionDefaults: Record<SectionType, string> = {
  PLAN: "Plan",
  START: "Start",
  OPERATE: "Operate",
};
