interface OperatingPhase {
  readonly id: OperatingPhaseId;
  readonly hasCompletedTaxRegistration: boolean;
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
    }
  );
};

export const OperatingPhases: OperatingPhase[] = [
  {
    id: "GUEST_MODE",
    hasCompletedTaxRegistration: false,
  },
  {
    id: "FORMED_AND_REGISTERED",
    hasCompletedTaxRegistration: true,
  },
  {
    id: "NEEDS_TO_FORM",
    hasCompletedTaxRegistration: false,
  },
  {
    id: "NEEDS_TO_REGISTER_FOR_TAXES",
    hasCompletedTaxRegistration: false,
  },
  {
    id: "UP_AND_RUNNING",
    hasCompletedTaxRegistration: true,
  },
];
