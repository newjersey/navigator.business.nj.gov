import {AnytimeActionTask} from "@/lib/types/types";
import {fetchAnytimeActionByFilename} from "@/lib/async-content-fetchers/fetchAnytimeActionByFilename";

type TaxClearanceCertificateStepNames =
  | "Requirements"
  | "Check Eligibility"
  | "Review";

export const TaxClearanceCertificateSteps: {
  name: TaxClearanceCertificateStepNames;
}[] = [
  { name: "Requirements" },
  { name: "Check Eligibility" },
  { name: "Review" },
];

export const getAnytimeActionTaskObj = async (): Promise<AnytimeActionTask> => {
  return await fetchAnytimeActionByFilename("tax-clearance-certificate");
};

export const shouldDisplayPreviousButton = (stepIndex: number): boolean => {
  return stepIndex !== 0;
};

export const shouldDisplayContinueButton = (stepIndex: number): boolean => {
  return stepIndex === 0;
};

export const shouldDisplaySaveAndContinueButton = (stepIndex: number): boolean => {
  return stepIndex !== 0;
};
