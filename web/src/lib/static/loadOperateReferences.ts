import { loadFilingByFileName } from "@/lib/static/loadFilings";
import { loadOpportunityByFileName } from "@/lib/static/loadOpportunities";
import { OperateReference } from "@/lib/types/types";
import fs from "fs";
import path from "path";

const filingsDir = path.join(process.cwd(), "..", "content", "src", "filings");
const opportunityDir = path.join(process.cwd(), "..", "content", "src", "opportunities");

export const loadOperateReferences = (): Record<string, OperateReference> => {
  const filingFilenames = fs.readdirSync(filingsDir);
  const opportunityFilenames = fs.readdirSync(opportunityDir);
  const filingFileContents = filingFilenames.map((fileName) => ({
    ...loadFilingByFileName(fileName),
    origin: "filings" as Origin,
  }));
  const opportunityFileContents = opportunityFilenames.map((fileName) => ({
    ...loadOpportunityByFileName(fileName),
    origin: "opportunities" as Origin,
  }));

  const allContents: FileProperties[] = [...filingFileContents, ...opportunityFileContents];

  return allContents.reduce((acc: Record<string, OperateReference>, curr: FileProperties) => {
    acc[curr.id] = {
      name: curr.name,
      urlSlug: curr.urlSlug,
      urlPath: `/${curr.origin}/${curr.urlSlug}`,
    };
    return acc;
  }, {} as Record<string, OperateReference>);
};

type FileProperties = {
  name: string;
  id: string;
  urlSlug: string;
  origin: Origin;
};

type Origin = "filings" | "opportunities";
