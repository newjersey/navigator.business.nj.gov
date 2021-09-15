import { SectionType } from "@/lib/types/types";

export const RoadmapDefaults: Record<string, string> = {
  greyBoxBusinessNameText: "Business Name",
  greyBoxIndustryText: "Industry",
  greyBoxLegalStructureText: "Legal Structure",
  greyBoxMunicipalityText: "Location",
  greyBoxEditText: "Edit",
  greyBoxNotSetText: "Not set",
  greyBoxSomeOtherIndustryText: "X",
  roadmapTitleNotSet: "Your Business Roadmap",
  roadmapTitleTemplate: "Business Roadmap for ${businessName}",
  loadingText: "Loading...",
};

export const SectionDefaults: Record<SectionType, string> = {
  PLAN: "Plan",
  START: "Start",
};
