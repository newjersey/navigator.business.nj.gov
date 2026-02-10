import fs from "fs";
import matter from "gray-matter";
import path from "path";

const fundingDir = path.resolve(`${__dirname}/../../../content/src/fundings`);

export interface Funding {
  id: string;
  name: string;
  filename: string;
  urlSlug: string;
  callToActionLink: string;
  callToActionText: string;
  fundingType: string;
  programPurpose: string;
  agency: string[];
  agencyContact: string;
  publishStageArchive: string;
  openDate: string;
  dueDate: string;
  status: string;
  programFrequency: string;
  businessStage: string;
  employeesRequired: string;
  homeBased: string;
  certifications?: string[];
  preferenceForOpportunityZone: string;
  county: string;
  sector: string[];
  contentMd: string;
  [key: string]: unknown;
}

const convertFundingMd = (oppMdContents: string, filename: string): Funding => {
  const matterResult = matter(oppMdContents);
  const oppGrayMatter = matterResult.data;

  return {
    contentMd: matterResult.content.replaceAll('"', '""'),
    filename,
    ...oppGrayMatter,
  } as Funding;
};

export const loadAllFundings = (): Funding[] => {
  const fileNames = fs.readdirSync(fundingDir);
  return fileNames.map((fileName) => {
    return loadFundingByFileName(fileName);
  });
};

const loadFundingByFileName = (fileName: string): Funding => {
  const fullPath = path.join(fundingDir, `${fileName}`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  const fileNameWithoutMd = fileName.split(".md")[0];
  return convertFundingMd(fileContents, fileNameWithoutMd);
};

export const exportFundings = (): void => {
  const fundings = loadAllFundings();
  let csvContent = `id,name,filename,urlSlug,callToActionLink,callToActionText,fundingType,programPurpose,agency,agencyContact,publishStageArchive,openDate,dueDate,status,programFrequency,businessStage,employeesRequired,homeBased,certifications,preferenceForOpportunityZone,county,sector,contentMd\n`;

  for (const funding of fundings) {
    csvContent += `"${funding.id}","${funding.name}","${funding.filename}","${funding.urlSlug}","${
      funding.callToActionLink
    }","${funding.callToActionText}","${funding.fundingType}","${funding.programPurpose}","${
      funding.agency
    }","${funding.agencyContact}","${funding.publishStageArchive}","${funding.openDate}","${
      funding.dueDate
    }","${funding.status}","${funding.programFrequency}","${funding.businessStage}","${
      funding.employeesRequired
    }","${funding.homeBased}","${funding.certifications}","${funding.preferenceForOpportunityZone}","${
      funding.county
    }","${funding.sector}","${funding.contentMd.trim()}"\n`;
  }
  fs.writeFileSync("fundings.csv", csvContent);
};

if (!process.argv.some((i) => i.includes("fundingExport")) || process.env.NODE_ENV === "test") {
  // Skip execution
} else if (process.argv.some((i) => i.includes("--export"))) {
  exportFundings();
} else {
  console.log("Expected at least one argument! Use one of the following: ");
  console.log("--export = exports fundings as csv");
}
