export interface OperatingPhase {
  readonly id: OperatingPhaseId;
  readonly displayCompanyDemographicProfileFields: boolean;
  readonly displayCertifications: boolean;
  readonly displayFundings: boolean;
  readonly displayCalendarType: "NONE" | "LIST" | "FULL";
  readonly displayTaxAccessButton: boolean;
  readonly displayCalendarToggleButton: boolean;
  readonly displayRoadmapTasks: boolean;
  readonly displayHideableRoadmapTasks: boolean;
  readonly displayAltHomeBasedBusinessDescription: boolean;
  readonly municipalityRequiredForTradeName: boolean;
  readonly municipalityRequiredForPublicFiling: boolean;
  readonly businessNameRequired: boolean;
  readonly displayProfileOpportunityAlert: boolean;
  readonly sectorRequired: boolean;
  readonly displayBusinessStructurePrompt: boolean;
  readonly displayHomeBasedPrompt: boolean;
  readonly displayGoToProfileNudge: boolean;
}

export type OperatingPhaseId =
  | "GUEST_MODE"
  | "GUEST_MODE_WITH_BUSINESS_STRUCTURE"
  | "GUEST_MODE_OWNING"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "";

export const LookupOperatingPhaseById = (id: OperatingPhaseId | undefined): OperatingPhase => {
  return (
    OperatingPhases.find((x) => {
      return x.id === id;
    }) ?? {
      id: "",
      displayCompanyDemographicProfileFields: false,
      displayCertifications: false,
      displayFundings: false,
      displayCalendarType: "NONE",
      displayTaxAccessButton: false,
      displayCalendarToggleButton: false,
      displayRoadmapTasks: false,
      displayHideableRoadmapTasks: false,
      displayAltHomeBasedBusinessDescription: false,
      municipalityRequiredForTradeName: true,
      municipalityRequiredForPublicFiling: true,
      businessNameRequired: false,
      displayProfileOpportunityAlert: false,
      sectorRequired: false,
      displayBusinessStructurePrompt: false,
      displayHomeBasedPrompt: false,
      displayGoToProfileNudge: false
    }
  );
};

export const OperatingPhases: OperatingPhase[] = [
  {
    id: "GUEST_MODE",
    displayCompanyDemographicProfileFields: false,
    displayCertifications: false,
    displayFundings: false,
    displayCalendarType: "NONE",
    displayTaxAccessButton: false,
    displayCalendarToggleButton: false,
    displayRoadmapTasks: true,
    displayHideableRoadmapTasks: false,
    displayAltHomeBasedBusinessDescription: true,
    municipalityRequiredForTradeName: false,
    municipalityRequiredForPublicFiling: false,
    businessNameRequired: false,
    displayProfileOpportunityAlert: false,
    displayBusinessStructurePrompt: true,
    displayHomeBasedPrompt: false,
    sectorRequired: false,
    displayGoToProfileNudge: false
  },
  {
    id: "GUEST_MODE_WITH_BUSINESS_STRUCTURE",
    displayCompanyDemographicProfileFields: false,
    displayCertifications: false,
    displayFundings: false,
    displayCalendarType: "NONE",
    displayTaxAccessButton: false,
    displayCalendarToggleButton: false,
    displayRoadmapTasks: true,
    displayHideableRoadmapTasks: false,
    displayAltHomeBasedBusinessDescription: true,
    municipalityRequiredForTradeName: false,
    municipalityRequiredForPublicFiling: false,
    businessNameRequired: false,
    displayProfileOpportunityAlert: false,
    displayBusinessStructurePrompt: false,
    displayHomeBasedPrompt: true,
    sectorRequired: false,
    displayGoToProfileNudge: false
  },
  {
    id: "GUEST_MODE_OWNING",
    displayCompanyDemographicProfileFields: true,
    displayCertifications: true,
    displayFundings: true,
    displayCalendarType: "FULL",
    displayTaxAccessButton: true,
    displayCalendarToggleButton: true,
    displayRoadmapTasks: false,
    displayHideableRoadmapTasks: false,
    displayAltHomeBasedBusinessDescription: true,
    municipalityRequiredForTradeName: false,
    municipalityRequiredForPublicFiling: false,
    businessNameRequired: false,
    displayProfileOpportunityAlert: true,
    sectorRequired: true,
    displayBusinessStructurePrompt: false,
    displayHomeBasedPrompt: false,
    displayGoToProfileNudge: true
  },
  {
    id: "FORMED_AND_REGISTERED",
    displayCompanyDemographicProfileFields: true,
    displayCertifications: true,
    displayFundings: false,
    displayCalendarType: "LIST",
    displayRoadmapTasks: true,
    displayTaxAccessButton: false,
    displayCalendarToggleButton: false,
    displayHideableRoadmapTasks: false,
    displayAltHomeBasedBusinessDescription: true,
    municipalityRequiredForTradeName: true,
    municipalityRequiredForPublicFiling: true,
    businessNameRequired: true,
    displayProfileOpportunityAlert: false,
    displayBusinessStructurePrompt: false,
    displayHomeBasedPrompt: true,
    sectorRequired: false,
    displayGoToProfileNudge: false
  },
  {
    id: "NEEDS_TO_FORM",
    displayCompanyDemographicProfileFields: false,
    displayCertifications: false,
    displayFundings: false,
    displayCalendarType: "NONE",
    displayRoadmapTasks: true,
    displayTaxAccessButton: false,
    displayCalendarToggleButton: false,
    displayHideableRoadmapTasks: false,
    displayAltHomeBasedBusinessDescription: true,
    municipalityRequiredForTradeName: false, // situation never occurs
    municipalityRequiredForPublicFiling: false,
    businessNameRequired: false,
    displayProfileOpportunityAlert: false,
    sectorRequired: false,
    displayBusinessStructurePrompt: false,
    displayHomeBasedPrompt: true,
    displayGoToProfileNudge: false
  },
  {
    id: "NEEDS_BUSINESS_STRUCTURE",
    displayCompanyDemographicProfileFields: false,
    displayCertifications: false,
    displayFundings: false,
    displayCalendarType: "NONE",
    displayRoadmapTasks: true,
    displayTaxAccessButton: false,
    displayCalendarToggleButton: false,
    displayHideableRoadmapTasks: false,
    displayAltHomeBasedBusinessDescription: true,
    municipalityRequiredForTradeName: false, // situation never occurs
    municipalityRequiredForPublicFiling: false,
    businessNameRequired: false,
    displayProfileOpportunityAlert: false,
    displayBusinessStructurePrompt: true,
    displayHomeBasedPrompt: false,
    sectorRequired: false,
    displayGoToProfileNudge: false
  },
  {
    id: "NEEDS_TO_REGISTER_FOR_TAXES",
    displayCompanyDemographicProfileFields: false,
    displayCertifications: false,
    displayFundings: false,
    displayCalendarType: "LIST",
    displayTaxAccessButton: false,
    displayCalendarToggleButton: false,
    displayRoadmapTasks: true,
    displayHideableRoadmapTasks: false,
    displayAltHomeBasedBusinessDescription: true,
    municipalityRequiredForTradeName: false,
    municipalityRequiredForPublicFiling: true,
    businessNameRequired: false,
    displayProfileOpportunityAlert: false,
    sectorRequired: false,
    displayBusinessStructurePrompt: false,
    displayHomeBasedPrompt: true,
    displayGoToProfileNudge: false
  },
  {
    id: "UP_AND_RUNNING",
    displayCompanyDemographicProfileFields: true,
    displayCertifications: true,
    displayFundings: true,
    displayCalendarType: "FULL",
    displayTaxAccessButton: true,
    displayCalendarToggleButton: true,
    displayRoadmapTasks: false,
    displayHideableRoadmapTasks: true,
    displayAltHomeBasedBusinessDescription: false,
    municipalityRequiredForTradeName: true,
    municipalityRequiredForPublicFiling: true,
    businessNameRequired: true,
    displayProfileOpportunityAlert: false,
    displayBusinessStructurePrompt: false,
    displayHomeBasedPrompt: false,
    sectorRequired: true,
    displayGoToProfileNudge: true
  },
  {
    id: "UP_AND_RUNNING_OWNING",
    displayCompanyDemographicProfileFields: true,
    displayCertifications: true,
    displayFundings: true,
    displayCalendarType: "FULL",
    displayTaxAccessButton: true,
    displayCalendarToggleButton: true,
    displayRoadmapTasks: false,
    displayHideableRoadmapTasks: false,
    displayAltHomeBasedBusinessDescription: false,
    municipalityRequiredForTradeName: false,
    municipalityRequiredForPublicFiling: false,
    businessNameRequired: false,
    displayProfileOpportunityAlert: true,
    sectorRequired: true,
    displayBusinessStructurePrompt: false,
    displayHomeBasedPrompt: false,
    displayGoToProfileNudge: true
  }
];
