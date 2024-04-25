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
  readonly displayProfileOpportunityAlert: boolean;
  readonly sectorRequired: boolean;
  readonly displayBusinessStructurePrompt: boolean;
  readonly displayHomeBasedPrompt: boolean;
  readonly displayGoToProfileNudge: boolean;
  readonly displayQuickActions: boolean;
  readonly displaySidebarCardNotRegistered: boolean;
}

export type OperatingPhaseId =
  | "GUEST_MODE"
  | "GUEST_MODE_WITH_BUSINESS_STRUCTURE"
  | "GUEST_MODE_OWNING"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "NEEDS_TO_FORM"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
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
      displayProfileOpportunityAlert: false,
      sectorRequired: false,
      displayBusinessStructurePrompt: false,
      displayHomeBasedPrompt: false,
      displayGoToProfileNudge: false,
      displayQuickActions: false,
      displaySidebarCardNotRegistered: false,
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
    displayProfileOpportunityAlert: false,
    displayBusinessStructurePrompt: true,
    displayHomeBasedPrompt: false,
    sectorRequired: false,
    displayGoToProfileNudge: false,
    displayQuickActions: false,
    displaySidebarCardNotRegistered: true,
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
    displayProfileOpportunityAlert: false,
    displayBusinessStructurePrompt: false,
    displayHomeBasedPrompt: true,
    sectorRequired: false,
    displayGoToProfileNudge: false,
    displayQuickActions: false,
    displaySidebarCardNotRegistered: true,
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
    displayProfileOpportunityAlert: true,
    sectorRequired: true,
    displayBusinessStructurePrompt: false,
    displayHomeBasedPrompt: false,
    displayGoToProfileNudge: true,
    displayQuickActions: true,
    displaySidebarCardNotRegistered: true,
  },
  {
    id: "FORMED",
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
    displayProfileOpportunityAlert: false,
    displayBusinessStructurePrompt: false,
    displayHomeBasedPrompt: true,
    sectorRequired: false,
    displayGoToProfileNudge: false,
    displayQuickActions: false,
    displaySidebarCardNotRegistered: false,
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
    displayProfileOpportunityAlert: false,
    sectorRequired: false,
    displayBusinessStructurePrompt: false,
    displayHomeBasedPrompt: true,
    displayGoToProfileNudge: false,
    displayQuickActions: false,
    displaySidebarCardNotRegistered: false,
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
    displayProfileOpportunityAlert: false,
    displayBusinessStructurePrompt: true,
    displayHomeBasedPrompt: false,
    sectorRequired: false,
    displayGoToProfileNudge: false,
    displayQuickActions: false,
    displaySidebarCardNotRegistered: false,
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
    displayProfileOpportunityAlert: true,
    displayBusinessStructurePrompt: false,
    displayHomeBasedPrompt: false,
    sectorRequired: true,
    displayGoToProfileNudge: true,
    displayQuickActions: true,
    displaySidebarCardNotRegistered: false,
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
    displayProfileOpportunityAlert: true,
    sectorRequired: true,
    displayBusinessStructurePrompt: false,
    displayHomeBasedPrompt: false,
    displayGoToProfileNudge: true,
    displayQuickActions: true,
    displaySidebarCardNotRegistered: false,
  },
  {
    id: "REMOTE_SELLER_WORKER",
    displayCompanyDemographicProfileFields: false,
    displayCertifications: false,
    displayFundings: false,
    displayCalendarType: "NONE",
    displayRoadmapTasks: true,
    displayTaxAccessButton: false,
    displayCalendarToggleButton: false,
    displayHideableRoadmapTasks: false,
    displayAltHomeBasedBusinessDescription: false,
    municipalityRequiredForTradeName: false,
    municipalityRequiredForPublicFiling: false,
    displayProfileOpportunityAlert: false,
    sectorRequired: false,
    displayBusinessStructurePrompt: false,
    displayHomeBasedPrompt: false,
    displayGoToProfileNudge: false,
    displayQuickActions: false,
    displaySidebarCardNotRegistered: false,
  },
];
