import { Roadmap } from "../types/roadmaps";

export const removeLiquorLicenseTasks = (roadmap: Roadmap): Roadmap => {
  const planLocationStep = roadmap.steps.find((step) => step.id === "plan_your_location");
  if (!planLocationStep) return roadmap;

  planLocationStep.tasks = planLocationStep.tasks.filter((task) => task.id !== "liquor_license_availability");

  const leaseAndPermitsStep = roadmap.steps.find((step) => step.id === "lease_and_permits");
  if (!leaseAndPermitsStep) return roadmap;

  leaseAndPermitsStep.tasks = leaseAndPermitsStep.tasks.filter((task) => task.id !== "liquor_license");
  return roadmap;
};
