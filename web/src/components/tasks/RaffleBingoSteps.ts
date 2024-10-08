import { fetchTaskByFilename } from "@/lib/async-content-fetchers/fetchTaskByFilename";
import { Task } from "@/lib/types/types";

export const raffleBingoStepFiles = ["raffle-license-step-1", "raffle-license-step-2"];

export const getRaffleBingoStep = async (stepIndex: number): Promise<Task> => {
  console.log("raffleBingoStepFiles", raffleBingoStepFiles);
  console.log("raffleBingoStepFiles length:", raffleBingoStepFiles.length);

  const fileName = raffleBingoStepFiles[stepIndex];
  console.log("fileName:", fileName);
  console.log("stepIndex:", stepIndex);
  const step = await fetchTaskByFilename(fileName);
  return step;
};
console.log("step 1:", getRaffleBingoStep(0));
console.log("step 2:", getRaffleBingoStep(1));

export const isNotLastStep = (stepIndex: number): boolean => {
  return stepIndex !== raffleBingoStepFiles.length - 1;
};

export const isNotFirstStep = (stepIndex: number): boolean => {
  return stepIndex !== 0;
};

export const isLastStep = (stepIndex: number): boolean => {
  return stepIndex === raffleBingoStepFiles.length - 1;
};
