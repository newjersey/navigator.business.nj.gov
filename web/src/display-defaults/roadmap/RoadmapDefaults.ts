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
  operateFormSubmitButtonText: "Submit",
  calendarFilingDueDateLabel: "Due",
  congratulatorModalTitle: "You did it!",
  congratulatorModalHeader: "You reached a crucial milestone as a business.",
  congratulatorModalBody: "You can now start your",
  congratulatorModalLinkText: "tasks.",
  operateComplianceText:
    "After you've started your business, you must stay in compliance with the State. Visit [Premier Business Services](https://www16.state.nj.us/NJ_PREMIER_EBIZ/jsp/home.jsp) to register.",
};

export const SectionDefaults: Record<SectionType, string> = {
  PLAN: "Plan",
  START: "Start",
  OPERATE: "Operate",
};
