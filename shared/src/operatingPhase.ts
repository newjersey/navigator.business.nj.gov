interface OperatingPhase {
  readonly id: OperatingPhaseId;
  readonly displayCompanyDemographicProfileFields: boolean;
  readonly displayCertifications: boolean;
  readonly displayFundings: boolean;
  readonly displayListCalendar: boolean;
  readonly displayFullCalendar: boolean;
  readonly displayRoadmapTasks: boolean;
  readonly displayHideableRoadmapTasks: boolean;
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
    OperatingPhases.find((x) => x.id === id) ?? {
      id: "",
      displayCompanyDemographicProfileFields: false,
      displayCertifications: false,
      displayFundings: false,
      displayListCalendar: false,
      displayFullCalendar: false,
      displayRoadmapTasks: false,
      displayHideableRoadmapTasks: false,
    }
  );
};

export const OperatingPhases: OperatingPhase[] = [
  {
    id: "GUEST_MODE",
    displayCompanyDemographicProfileFields: false,
    displayCertifications: false,
    displayFundings: false,
    displayListCalendar: false,
    displayFullCalendar: false,
    displayRoadmapTasks: true,
    displayHideableRoadmapTasks: false,
  },
  {
    id: "GUEST_MODE_OWNING",
    displayCompanyDemographicProfileFields: true,
    displayCertifications: true,
    displayFundings: true,
    displayListCalendar: false,
    displayFullCalendar: true,
    displayRoadmapTasks: false,
    displayHideableRoadmapTasks: false,
  },
  {
    id: "FORMED_AND_REGISTERED",
    displayCompanyDemographicProfileFields: true,
    displayCertifications: true,
    displayFundings: false,
    displayListCalendar: true,
    displayFullCalendar: false,
    displayRoadmapTasks: true,
    displayHideableRoadmapTasks: false,
  },
  {
    id: "NEEDS_TO_FORM",
    displayCompanyDemographicProfileFields: false,
    displayCertifications: false,
    displayFundings: false,
    displayListCalendar: false,
    displayFullCalendar: false,
    displayRoadmapTasks: true,
    displayHideableRoadmapTasks: false,
  },
  {
    id: "NEEDS_TO_REGISTER_FOR_TAXES",
    displayCompanyDemographicProfileFields: false,
    displayCertifications: false,
    displayFundings: false,
    displayListCalendar: true,
    displayFullCalendar: false,
    displayRoadmapTasks: true,
    displayHideableRoadmapTasks: false,
  },
  {
    id: "UP_AND_RUNNING",
    displayCompanyDemographicProfileFields: true,
    displayCertifications: true,
    displayFundings: true,
    displayListCalendar: false,
    displayFullCalendar: true,
    displayRoadmapTasks: false,
    displayHideableRoadmapTasks: true,
  },
  {
    id: "UP_AND_RUNNING_OWNING",
    displayCompanyDemographicProfileFields: true,
    displayCertifications: true,
    displayFundings: true,
    displayListCalendar: false,
    displayFullCalendar: true,
    displayRoadmapTasks: false,
    displayHideableRoadmapTasks: false,
  },
];
