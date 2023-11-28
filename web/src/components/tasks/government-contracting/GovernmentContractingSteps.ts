import { fetchQuickActionByFilename } from "@/lib/async-content-fetchers/fetchQuickActionByFilename";
import { QuickActionTask } from "@/lib/types/types";

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

export const getQuickActionTaskObj = async (stepIndex: number): Promise<QuickActionTask> => {
  return await fetchQuickActionByFilename(GovernmentContractingSteps[stepIndex].fileName);
};
