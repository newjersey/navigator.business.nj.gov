import { fetchTaskByFilename } from "@/lib/async-content-fetchers/fetchTaskByFilename";
import { Task } from "@/lib/types/types";
import { arrayOfTaskAgencies } from "@businessnjgovnavigator/shared/taskAgency";

type RaffleBingoStepLabels = "Get an ID Number" | "From Your NJ Municipality";

export const RaffleBingoSteps: {
  stepLabel: RaffleBingoStepLabels;
  fileName: string;
  agencyId: string;
}[] = [
  {
    stepLabel: "Get an ID Number",
    fileName: "raffle-license-step-1",
    agencyId: "games-of-chance-control-commission",
  },
  { stepLabel: "From Your NJ Municipality", fileName: "raffle-license-step-2", agencyId: "nj-municipality" },
];

export const getRaffleBingoTask = async (stepIndex: number): Promise<Task> => {
  return await fetchTaskByFilename(RaffleBingoSteps[stepIndex].fileName);
};

export const getAgencyName = (agencyId: string): string => {
  const issuingAgency = arrayOfTaskAgencies.find((agency) => agency.id === agencyId);
  return issuingAgency!.name;
};

export const shouldDisplayContinueButton = (stepIndex: number): boolean => {
  return stepIndex !== RaffleBingoSteps.length - 1;
};

export const shouldDisplayBackButton = (stepIndex: number): boolean => {
  return stepIndex !== 0;
};

export const shouldDisplayMarkAsCompleteButton = (stepIndex: number): boolean => {
  return stepIndex === RaffleBingoSteps.length - 1;
};

export const shouldDisplayCTAButton = (): boolean => {
  return true;
};
