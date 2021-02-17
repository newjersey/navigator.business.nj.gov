export const ALL_STEPS = ["plan_your_location", "business_license", "register_business", "lease_and_permits"];

type ElementType<T extends ReadonlyArray<unknown>> = T extends ReadonlyArray<infer ElementType>
  ? ElementType
  : never;

export type StepId = ElementType<typeof ALL_STEPS>;
