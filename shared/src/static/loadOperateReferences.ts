import { OperateReference } from "../types/types";
import { loadAllCertifications } from "./loadCertifications";
import { loadAllFilings } from "./loadFilings";
import { loadAllFundings } from "./loadFundings";

export const loadOperateReferences = (): Record<string, OperateReference> => {
  const filingFileContents = loadAllFilings().map((filing) => {
    return {
      ...filing,
      origin: "filings" as Origin,
    };
  });
  const fundingFileContents = loadAllFundings().map((funding) => {
    return {
      ...funding,
      origin: "funding" as Origin,
    };
  });
  const certificationFileContents = loadAllCertifications().map((cert) => {
    return {
      ...cert,
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
