import fs from "fs";
import path from "path";
import { Step } from "@businessnjgovnavigator/shared/types";

const stepsJsonPathTest = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "roadmaps",
  "steps.json",
);
const stepsForeignJsonPathTest = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "roadmaps",
  "steps-foreign.json",
);
const stepsDomesticJsonPathTest = path.join(
  process.cwd(),
  "..",
  "content",
  "src",
  "roadmaps",
  "steps-domestic-employer.json",
);

export const loadStepsJsonPathTestJsonForTest = (): Step[] => {
  return JSON.parse(fs.readFileSync(stepsJsonPathTest, "utf8")).steps;
};
export const loadForeignStepsJsonPathTestJsonForTest = (): Step[] => {
  return JSON.parse(fs.readFileSync(stepsForeignJsonPathTest, "utf8")).steps;
};
export const loadDomesticStepsJsonPathTestJsonForTest = (): Step[] => {
  return JSON.parse(fs.readFileSync(stepsDomesticJsonPathTest, "utf8")).steps;
};
