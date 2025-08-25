import fs from "fs";
import path from "path";
import { OperateReference } from "../types/types";
import { loadCertificationByFileName } from "./loadCertifications";
import { loadFilingByFileName } from "./loadFilings";
import { loadFundingByFileName } from "./loadFundings";

const filingsDirectory = path.join(process.cwd(), "..", "content", "src", "filings");
const fundingsDirectory = path.join(process.cwd(), "..", "content", "src", "fundings");
const certificationsDirectory = path.join(process.cwd(), "..", "content", "src", "certifications");

export const loadOperateReferences = (): Record<string, OperateReference> => {
  const filingFilenames = fs.readdirSync(filingsDirectory);
  const fundingFilenames = fs.readdirSync(fundingsDirectory);
  const certFilenames = fs.readdirSync(certificationsDirectory);
  const filingFileContents = filingFilenames.map((fileName) => {
    return {
      ...loadFilingByFileName(fileName),
      origin: "filings" as Origin,
    };
  });
  const fundingFileContents = fundingFilenames.map((fileName) => {
    return {
      ...loadFundingByFileName(fileName),
      origin: "funding" as Origin,
    };
  });
  const certificationFileContents = certFilenames.map((fileName) => {
    return {
      ...loadCertificationByFileName(fileName),
      origin: "certification" as Origin,
    };
  });

  const allContents: FileProperties[] = [
    ...filingFileContents,
    ...fundingFileContents,
    ...certificationFileContents,
  ];

  // eslint-disable-next-line unicorn/no-array-reduce
  return allContents.reduce(
    (accumulator: Record<string, OperateReference>, current: FileProperties) => {
      accumulator[current.id] = {
        name: current.name,
        urlSlug: current.urlSlug,
        urlPath: `/${current.origin}/${current.urlSlug}`,
      };
      return accumulator;
    },
    {} as Record<string, OperateReference>,
  );
};

type FileProperties = {
  name: string;
  id: string;
  urlSlug: string;
  origin: Origin;
};

type Origin = "filings" | "funding" | "certification";
