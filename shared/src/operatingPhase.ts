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
  readonly feedbackFormToDisplay: "STARTING" | "OWNING" | "";
}

export type OperatingPhaseId =
  | "GUEST_MODE"
  | "GUEST_MODE_OWNING"
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
      feedbackFormToDisplay: "",
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
    feedbackFormToDisplay: "STARTING",
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
    municipalityRequiredForTradeName: true,
    municipalityRequiredForPublicFiling: true,
    feedbackFormToDisplay: "OWNING",
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
    feedbackFormToDisplay: "STARTING",
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
    feedbackFormToDisplay: "STARTING",
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
    feedbackFormToDisplay: "STARTING",
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
    feedbackFormToDisplay: "OWNING",
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
    municipalityRequiredForTradeName: true,
    municipalityRequiredForPublicFiling: true,
    feedbackFormToDisplay: "OWNING",
  },
];
