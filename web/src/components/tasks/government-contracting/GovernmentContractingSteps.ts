import { fetchAnytimeActionByFilename } from "@/lib/async-content-fetchers/fetchAnytimeActionByFilename";
import { AnytimeActionTask } from "@/lib/types/types";

type GovernmentContractingStepNames =
  | "NJSTART"
  | "Apprenticeship Program"
  | "Public Works"
  | "Prevailing Wages";

export const GovernmentContractingSteps: {
  name: GovernmentContractingStepNames;
  fileName: string;
}[] = [
  { name: "NJSTART", fileName: "njstart-registration" },
  { name: "Apprenticeship Program", fileName: "apprenticeship-program-intake" },
  { name: "Public Works", fileName: "public-works-contractor-registration" },
  { name: "Prevailing Wages", fileName: "prevailing-wage" },
];

export const getAnytimeActionTaskObj = async (stepIndex: number): Promise<AnytimeActionTask> => {
  return await fetchAnytimeActionByFilename(GovernmentContractingSteps[stepIndex].fileName);
};

export const shouldDisplayPreviousButton = (stepIndex: number): boolean => {
  return stepIndex !== 0;
};

export const shouldDisplayContinueButton = (stepIndex: number): boolean => {
  return stepIndex !== GovernmentContractingSteps.length - 1;
};
