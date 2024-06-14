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
  readonly displayAnytimeActions: boolean;
  readonly displaySidebarCardNotRegistered: boolean;
}

export interface UnknownOperatingPhase extends Omit<OperatingPhase, "id"> {
  readonly id: "";
}

export enum OperatingPhaseId {
  GUEST_MODE = "GUEST_MODE",
  GUEST_MODE_WITH_BUSINESS_STRUCTURE = "GUEST_MODE_WITH_BUSINESS_STRUCTURE",
  GUEST_MODE_OWNING = "GUEST_MODE_OWNING",
  NEEDS_BUSINESS_STRUCTURE = "NEEDS_BUSINESS_STRUCTURE",
  NEEDS_TO_FORM = "NEEDS_TO_FORM",
  FORMED = "FORMED",
  UP_AND_RUNNING = "UP_AND_RUNNING",
  UP_AND_RUNNING_OWNING = "UP_AND_RUNNING_OWNING",
  REMOTE_SELLER_WORKER = "REMOTE_SELLER_WORKER",
}

export const LookupOperatingPhaseById = (id?: OperatingPhaseId): OperatingPhase | UnknownOperatingPhase => {
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
      displayAnytimeActions: false,
      displaySidebarCardNotRegistered: false,
    }
  );
};

export const OperatingPhases: OperatingPhase[] = [
  {
    id: OperatingPhaseId.GUEST_MODE,
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
    displayAnytimeActions: false,
    displaySidebarCardNotRegistered: true,
  },
  {
    id: OperatingPhaseId.GUEST_MODE_WITH_BUSINESS_STRUCTURE,
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
    displayAnytimeActions: false,
    displaySidebarCardNotRegistered: true,
  },
  {
    id: OperatingPhaseId.GUEST_MODE_OWNING,
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
    displayAnytimeActions: true,
    displaySidebarCardNotRegistered: true,
  },
  {
    id: OperatingPhaseId.FORMED,
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
    displayAnytimeActions: false,
    displaySidebarCardNotRegistered: false,
  },
  {
    id: OperatingPhaseId.NEEDS_TO_FORM,
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
    displayAnytimeActions: false,
    displaySidebarCardNotRegistered: false,
  },
  {
    id: OperatingPhaseId.NEEDS_BUSINESS_STRUCTURE,
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
    displayAnytimeActions: false,
    displaySidebarCardNotRegistered: false,
  },
  {
    id: OperatingPhaseId.UP_AND_RUNNING,
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
    displayAnytimeActions: true,
    displaySidebarCardNotRegistered: false,
  },
  {
    id: OperatingPhaseId.UP_AND_RUNNING_OWNING,
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
    displayAnytimeActions: true,
    displaySidebarCardNotRegistered: false,
  },
  {
    id: OperatingPhaseId.REMOTE_SELLER_WORKER,
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
    displayAnytimeActions: false,
    displaySidebarCardNotRegistered: false,
  },
];
