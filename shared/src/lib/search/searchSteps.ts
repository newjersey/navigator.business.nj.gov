import { Step } from "../../types";
import { findMatchInLabelledText } from "./helpers";
import { FileData, Match } from "./typesForSearch";

export const searchSteps = (
  steps: Step[],
  term: string,
  parameters: { filename: string; displayTitle: string },
): Match[] => {
  const matches: Match[] = [];

  const stepData = getStepData(steps);

  for (const stepDataItem of stepData) {
    let match: Match = {
      filename: parameters.filename,
      snippets: [],
      displayTitle: parameters.displayTitle,
    };

    match = findMatchInLabelledText(stepDataItem.labelledTexts, term, match);

    if (match.snippets.length > 0) {
      match.displayTitle = `${match.displayTitle} (Step ${stepDataItem.stepNumber})`;
      matches.push(match);
    }
  }

  return matches;
};

export const getStepData = (steps: Step[]): Array<FileData & { stepNumber: number }> => {
  const stepData: Array<FileData & { stepNumber: number }> = [];

  for (const step of steps) {
    const name = step.name.toLowerCase();
    const description = step.description.toLowerCase();

    const labelledTexts = [
      { content: description, label: "Description" },
      { content: name, label: "Name" },
    ];

    stepData.push({
      fileName: `step file, ${name}: ${step.stepNumber.toString()}`,
      labelledTexts,
      blockTexts: [], // No blockTexts needed for steps
      listTexts: [], // No listTexts needed for steps
      stepNumber: step.stepNumber,
    });
  }

  return stepData;
};
