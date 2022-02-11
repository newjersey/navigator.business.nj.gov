import { loadCertificationByFileName } from "@/lib/static/loadCertifications";
import { loadFilingByFileName } from "@/lib/static/loadFilings";
import { loadFundingByFileName } from "@/lib/static/loadFundings";
import { OperateReference } from "@/lib/types/types";
import fs from "fs";
import path from "path";

const filingsDir = path.join(process.cwd(), "..", "content", "src", "filings");
const fundingsDir = path.join(process.cwd(), "..", "content", "src", "fundings");
const certificationsDir = path.join(process.cwd(), "..", "content", "src", "certifications");

export const loadOperateReferences = (): Record<string, OperateReference> => {
  const filingFilenames = fs.readdirSync(filingsDir);
  const fundingFilenames = fs.readdirSync(fundingsDir);
  const certFilenames = fs.readdirSync(certificationsDir);
  const filingFileContents = filingFilenames.map((fileName) => ({
    ...loadFilingByFileName(fileName),
    origin: "filings" as Origin,
  }));
  const fundingFileContents = fundingFilenames.map((fileName) => ({
    ...loadFundingByFileName(fileName),
    origin: "funding" as Origin,
  }));
  const certificationFileContents = certFilenames.map((fileName) => ({
    ...loadCertificationByFileName(fileName),
    origin: "certification" as Origin,
  }));

  const allContents: FileProperties[] = [
    ...filingFileContents,
    ...fundingFileContents,
    ...certificationFileContents,
  ];

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

type Origin = "filings" | "funding" | "certification";
