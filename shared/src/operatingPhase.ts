interface OperatingPhase {
  readonly id: OperatingPhaseId;
  readonly hasCompletedTaxRegistration: boolean;
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
      hasCompletedTaxRegistration: false,
      displayCertifications: false,
    }
  );
};

export const OperatingPhases: OperatingPhase[] = [
  {
    id: "GUEST_MODE",
    hasCompletedTaxRegistration: false,
    displayCertifications: false,
  },
  {
    id: "FORMED_AND_REGISTERED",
    hasCompletedTaxRegistration: true,
    displayCertifications: true,
  },
  {
    id: "NEEDS_TO_FORM",
    hasCompletedTaxRegistration: false,
    displayCertifications: false,
  },
  {
    id: "NEEDS_TO_REGISTER_FOR_TAXES",
    hasCompletedTaxRegistration: false,
    displayCertifications: false,
  },
  {
    id: "UP_AND_RUNNING",
    hasCompletedTaxRegistration: true,
    displayCertifications: true,
  },
];
