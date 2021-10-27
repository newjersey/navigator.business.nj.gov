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
  greyBoxEditText: "Go to Profile",
  greyBoxHeaderText: "Business Profile",
  greyBoxNotSetText: "Not set",
  greyBoxSomeOtherIndustryText: "X",
  greyBoxViewMoreText: "View More",
  greyBoxViewLessText: "View Less",
  roadmapTitleNotSet: "Your Business Roadmap",
  roadmapTitleTemplate: "Business Roadmap for ${businessName}",
  loadingText: "Loading...",
  operateDateSubmitButtonText: "Submit",
  dateOfFormationEditText: "Edit your business formation date.",
  dateOfFormationErrorText: "Invalid Date",
  calendarFilingDueDateLabel: "Due",
  calendarHeader: "Next 12 Months",
  calendarTooltip:
    "This is your personalized calendar of upcoming of taxes and filings that the New Jersey Department of Treasury has identified. Click on any item to learn about the filing and how you can comply.",
  dateOfFormationHelperText: "Your annual report is based on your business formation date.",
  congratulatorModalTitle: "You did it!",
  congratulatorModalHeader: "You reached a crucial milestone as a business.",
  congratulatorModalBody: "You can now start your",
  congratulatorModalLinkText: "tasks.",
  operateComplianceText: "After you've started your business, you must stay in compliance with the State. Visit [Premier Business Services](https://www16.state.nj.us/NJ_PREMIER_EBIZ/jsp/home.jsp) to register."
};

export const SectionDefaults: Record<SectionType, string> = {
  PLAN: "Plan",
  START: "Start",
  OPERATE: "Operate",
};
