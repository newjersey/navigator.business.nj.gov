interface OperatingPhase {
  readonly id: OperatingPhaseId;
  readonly displayCompanyDemographicProfileFields: boolean;
  readonly displayCertifications: boolean;
}

export type OperatingPhaseId =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "";

export const LookupOperatingPhaseById = (id: OperatingPhaseId | undefined): OperatingPhase => {
  return (
    OperatingPhases.find((x) => x.id === id) ?? {
      id: "",
      displayCompanyDemographicProfileFields: false,
      displayCertifications: false,
    }
  );
};

export const OperatingPhases: OperatingPhase[] = [
  {
    id: "GUEST_MODE",
    displayCompanyDemographicProfileFields: false,
    displayCertifications: false,
  },
  {
    id: "FORMED_AND_REGISTERED",
    displayCompanyDemographicProfileFields: true,
    displayCertifications: true,
  },
  {
    id: "NEEDS_TO_FORM",
    displayCompanyDemographicProfileFields: false,
    displayCertifications: false,
  },
  {
    id: "NEEDS_TO_REGISTER_FOR_TAXES",
    displayCompanyDemographicProfileFields: false,
    displayCertifications: false,
  },
  {
    id: "UP_AND_RUNNING",
    displayCompanyDemographicProfileFields: true,
    displayCertifications: true,
  },
];
